#!/usr/bin/env python3
"""Rotate still WebP images using the installed WebP tools and macOS sips."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


def rotate(source: Path, direction: str, in_place: bool) -> Path:
    if not source.is_file() or source.suffix.lower() != '.webp':
        raise ValueError(f'不是可读取的 WebP 文件：{source}')
    with source.open('rb') as f:
        header = f.read(21)
    if len(header) < 20 or header[:4] != b'RIFF' or header[8:12] != b'WEBP':
        raise ValueError(f'不是有效的 WebP 文件：{source}')
    if header[12:16] == b'VP8X' and len(header) > 20 and header[20] & 0x02:
        raise ValueError(f'暂不支持动态 WebP：{source}')

    output = source if in_place else source.with_name(f'{source.stem}-{direction}.webp')
    if not in_place and output.exists():
        raise ValueError(f'输出文件已存在，未覆盖：{output}')
    angle = {'left': '270', 'right': '90', '180': '180'}[direction]
    with tempfile.TemporaryDirectory(prefix='.rotate-webp-', dir=source.parent) as folder:
        temp = Path(folder)
        decoded, turned, result = temp / 'decoded.png', temp / 'turned.png', temp / 'result.webp'
        for command in (["dwebp", str(source), '-o', str(decoded)],
                        ['sips', '-r', angle, str(decoded), '--out', str(turned)],
                        ['cwebp', '-quiet', '-lossless', '-exact', str(turned), '-o', str(result)]):
            subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        if in_place:
            os.chmod(result, source.stat().st_mode & 0o777)
        os.replace(result, output)
    return output


def main() -> int:
    parser = argparse.ArgumentParser(description='旋转静态 WebP 图片（默认生成新文件，保留原图）。')
    parser.add_argument('direction', choices=['left', 'right', '180'], help='向左 90°、向右 90°、旋转 180°')
    parser.add_argument('images', nargs='+', type=Path, help='一张或多张 WebP 图片')
    parser.add_argument('--in-place', action='store_true', help='替换原图；默认生成带方向后缀的新文件')
    args = parser.parse_args()
    missing = [tool for tool in ('dwebp', 'cwebp', 'sips') if not shutil.which(tool)]
    if missing:
        parser.error('缺少工具：' + ', '.join(missing) + '。macOS 可用 brew install webp 安装 WebP 工具。')
    failed = False
    for path in args.images:
        try:
            print(f'{path} → {rotate(path, args.direction, args.in_place)}')
        except (ValueError, OSError, subprocess.CalledProcessError) as exc:
            detail = exc.stderr.decode(errors='replace').strip() if isinstance(exc, subprocess.CalledProcessError) and exc.stderr else str(exc)
            print(f'处理失败：{path}：{detail}', file=sys.stderr)
            failed = True
    return int(failed)


if __name__ == '__main__':
    sys.exit(main())
