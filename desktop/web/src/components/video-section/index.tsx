import { tw } from 'twind';
import Preferences from '@/constants/svg/preferences.svg';

const VideoSection = () => (
  <section className={tw(`bg-gradient-to-b from-gray-50 to-white shadow-inner`)}>
    <div className={tw(`max-w-7xl mx-auto`)}>
      <div className={tw(`flex flex-col max-w-4xl mx-auto pt-28`)}>
        <div className={tw(`w-full`)}>
          <div className={tw(`relative shadow-2xl mx-6 lg:mx-0`)}>
            <Preferences width="100%" height="100%" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default VideoSection;
