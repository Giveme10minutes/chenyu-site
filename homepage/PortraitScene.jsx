import React from "react";

export default function PortraitScene({ assets }) {
  return (
    <div className="portrait-frame">
      <section className="portrait-shot portrait-opening">
        <div className="portrait">
          <img src={assets + "portrait.webp"} width="1122" height="1402" alt="陈煜身穿深蓝色 Polo 衫，直视镜头" />
        </div>
        <h1 className="portrait-caption">陈煜</h1>
      </section>
      <section className="portrait-shot portrait-invite">
        <img className="portrait-actor" src={assets + "portrait-invite.webp"} alt="陈煜伸手邀请访客入座" />
        <p className="portrait-caption">请坐。</p>
      </section>
      <section className="portrait-shot portrait-call">
        <img className="portrait-actor" src={assets + "portrait-call.webp"} alt="陈煜侧身朝画面外招呼" />
        <p className="portrait-caption">稍等，<br />我叫一下同事。</p>
      </section>
      <section className="portrait-shot portrait-team">
        <img className="portrait-actor" src={assets + "portrait-team.webp"} alt="五个陈煜同框，分别是跑步、做项目、正面肖像、弹吉他和拍摄时的样子" />
        <p className="portrait-caption">专业团队，<wbr />为你服务。</p>
      </section>
    </div>
  );
}
