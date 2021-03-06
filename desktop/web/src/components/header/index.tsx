import { tw, css } from 'twind/css';
import Wave from '../Wave';

const headerStyle = css`
  background-color: #ffffff;
  min-height: calc(100vh - 6rem);
`;

const Header = () => (
  <>
    <header className={tw(headerStyle)}>
      <div className={tw(`max-w-4xl mx-auto py-16 px-14 sm:px-6 lg:px-8`)}>
        <h1
          className={tw(`font-sans font-bold text-4xl md:text-5xl lg:text-8xl text-center leading-snug text-gray-800`)}
        >
          Chat With Friends And Family. Anytime, Anywhere.
        </h1>
        <div className={tw(`max-w-xl mx-auto`)}>
          <p className={tw(`mt-10 text-gray-500 text-center text-xl lg:text-3xl`)}></p>
        </div>
      </div>
      <div className={tw(`flex justify-center w-full`)}>
        <div className={tw(`mt-4 w-full`)}></div>
      </div>
      <Wave />
    </header>
  </>
);

export default Header;
