import React from 'react';
import waveStyles from '../styles/wave.module.css';

interface WaveProps {}

const Wave: React.FC<WaveProps> = ({}) => {
  return (
    <div className={`${waveStyles.waveWrapper} ${waveStyles.waveAnimation}`}>
      <div className={`${waveStyles.waveWrapperInner} ${waveStyles.bgTop}`}>
        <div
          className={`${waveStyles.wave} ${waveStyles.waveTop}`}
          style={{ backgroundImage: "url('https://www.singlestore.com/images/components/ribbon/rainbow.png')" }}
        ></div>
      </div>
      <div className={`${waveStyles.waveWrapperInner} ${waveStyles.bgMiddle}`}>
        <div
          className={`${waveStyles.wave} ${waveStyles.waveMiddle}`}
          style={{ backgroundImage: "url('https://www.singlestore.com/images/components/ribbon/rainbow.png')" }}
        ></div>
      </div>
      <div className={`${waveStyles.waveWrapperInner} ${waveStyles.bgBottom}`}>
        <div
          className={`${waveStyles.wave} ${waveStyles.waveBottom}`}
          style={{ backgroundImage: "url('https://www.singlestore.com/images/components/ribbon/rainbow.png')" }}
        ></div>
      </div>
    </div>
  );
};

export default Wave;
