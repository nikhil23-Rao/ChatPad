import { tw } from 'twind';
import FeatureSvg from '@/constants/svg/features.svg';
import Wave from '../Wave';
import { Fragment } from 'react';

const listItems = [
  {
    title: `Speed`,
    description: `Speed is very important, thats why ChatPad is blazing fast as we use techniques such as code splitting to optimize the amount of javascript rendered on each page to have a better expierience for you!`,
  },
  {
    title: `Performence`,
    description: `When using ChatPad performance is always high. This is because we pre-render each page before you get on, that means that features such as routing to a new page are blazingly fast.`,
  },
  {
    title: `The Best Features`,
    description: `When using ChatPad you will see the very best features. A few examples are dark theme, real-time chat, and many many more. To see more features scroll down.`,
  },
];

const ListSection = () => (
  <section className={tw(`lg:py-28 pt-28 overflow-hidden`)}>
    <div className={tw(`max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white`)}>
      <div className={tw(`mb-16 text-center`)}>
        <h2 className={tw(`text-base text-indigo-600 font-semibold tracking-wide uppercase`)}>Experience</h2>
        <p className={tw(`mt-2 pb-4 text-5xl lg:text-7xl font-bold tracking-tight text-gray-900`)}>
          Great User Experience
        </p>
      </div>
      <div className={tw(`flex flex-wrap -mx-8 items-center`)}>
        <div className={tw(`w-full lg:w-1/2 px-8`)}>
          <ul className={tw(`space-y-12`)}>
            {listItems.map((item, index) => (
              <Fragment key={index}>
                <li className={tw(`flex -mx-4`)} key={item.title}>
                  <div className={tw(`px-4`)}>
                    <span
                      className={tw(`flex w-16 h-16 mx-auto items-center
                      justify-center text-2xl font-bold rounded-full
                      bg-blue-50 text-blue-500`)}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div className={tw(`px-4`)}>
                    <h3 className={tw(`my-4 text-xl font-semibold`)}>{item.title}</h3>
                    <p className={tw(`text-gray-500 leading-loose`)}>{item.description}</p>
                  </div>
                </li>
              </Fragment>
            ))}
          </ul>
        </div>
        <div className={tw(`w-full lg:w-1/2 px-8`)}>
          <div className={tw(`lg:mb-12 lg:mb-0 pb-12 lg:pb-0 mt-16 lg:mt-0 mx-6 lg:mx-0`)}>
            <FeatureSvg width="100%" height="100%" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ListSection;
