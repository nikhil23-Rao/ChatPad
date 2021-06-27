import React from 'react';
import { css as emoCSS } from '@emotion/css';
import styled from '@emotion/styled';
import client from '@/../apollo-client';
import { GET_ALL_USERS } from '@/apollo/Queries';
import CryptoJS from 'crypto-js';

let items = [];

const GetAllItems = async () => {
  try {
    const result = await client.query({ query: GET_ALL_USERS });
    items = result.data.GetAllUsers;
  } catch (err) {
    console.log('Err', err);
  }
};

GetAllItems();

const css = (...args) => ({ className: emoCSS(...args) });

const Item = styled('li')(
  {
    position: 'relative',
    cursor: 'pointer',
    display: 'block',
    border: 'none',
    height: 'auto',
    textAlign: 'left',
    borderTop: 'none',
    lineHeight: '1em',
    fontSize: '1rem',
    textTransform: 'none',
    fontWeight: '400',
    boxShadow: 'none',
    padding: '.8rem 1.1rem',
    whiteSpace: 'normal',
    wordWrap: 'normal',
  } as any,
  ({ isActive, isSelected }: any) => {
    const styles: any[] = [];
    if (isActive) {
      styles.push({
        color: 'rgba(0,0,0,.95)',
      });
    }
    if (isSelected) {
      styles.push({
        // color: 'rgba(0,0,0,.95)',
        fontWeight: '700',
      });
    }
    return styles;
  },
);
const onAttention = '&:hover, &:focus';
const Input = styled('input')(
  {
    width: '100%', // full width - icon width/2 - border
    fontSize: 14,
    wordWrap: 'break-word',
    lineHeight: '1em',
    outline: 0,
    whiteSpace: 'normal',
    minHeight: '2em',
    background: '#fff',
    display: 'inline-block',
    padding: '1em 2em 1em 1em',
    boxShadow: 'none',
    borderRadius: '.30rem',
    transition: 'box-shadow .1s ease,width .1s ease',
    [onAttention]: {
      borderColor: '#96c8da',
      boxShadow: '0 2px 3px 0 rgba(34,36,38,.15)',
    },
  },
  ({ isOpen }: any) =>
    isOpen
      ? {
          borderBottomLeftRadius: '0',
          borderBottomRightRadius: '0',
          [onAttention]: {
            boxShadow: 'none',
          },
        }
      : null,
);

const Label = styled('label')({
  fontWeight: 'bold',
  display: 'block',
  marginBottom: 10,
});

const BaseMenu = styled('ul')(
  {
    padding: 0,
    marginTop: 0,
    position: 'fixed',
    width: '100%',
    // maxHeight: '20rem',
    overflowY: 'auto',
    overflowX: 'hidden',
    outline: '0',
    transition: 'opacity .1s ease',
    borderRadius: '0 0 .28571429rem .28571429rem',
    boxShadow: '0 2px 3px 0 rgba(34,36,38,.15)',
    borderColor: '#96c8da',
    borderTopWidth: '0',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderStyle: 'solid',
  } as any,
  ({ isOpen }: any) => ({
    border: isOpen ? null : ('none' as any),
  }),
);

const Menu = React.forwardRef((props, ref) => <BaseMenu innerRef={ref} {...props} />);

const ControllerButton = styled('button')({
  border: 'none',
  position: 'absolute',
  right: 0,
  top: 0,
  cursor: 'pointer',
  width: 47,
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
});

function ArrowIcon({ isOpen }) {
  return (
    <svg
      viewBox="0 0 20 20"
      preserveAspectRatio="none"
      width={16}
      fill="transparent"
      stroke="#979797"
      strokeWidth="1.1px"
      transform={isOpen ? 'rotate(180)' : undefined}
    >
      <path d="M1,6 L10,15 L19,6" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      preserveAspectRatio="none"
      width={12}
      fill="transparent"
      stroke="#979797"
      strokeWidth="1.1px"
    >
      <path d="M1,1 L19,19" />
      <path d="M19,1 L1,19" />
    </svg>
  );
}

const menuStyles = {
  maxHeight: 80,
  maxWidth: 300,
  overflowY: 'scroll',
  backgroundColor: '#000',
  padding: 0,
  listStyle: 'none',
  position: 'relative',
};

const menuMultipleStyles = {
  width: '135px',
  position: 'fixed',
  margin: 0,
  backgroundColor: '#000',
  listStyle: 'none',
  padding: 0,
  left: '340px',
};

const selectedItemStyles = {
  marginLeft: '5px',
  // backgroundColor: 'aliceblue',
  borderRadius: '10px',
};

const selectedItemIconStyles = { cursor: 'pointer' };

const comboboxStyles = { marginLeft: '5px', marginTop: 15, margin: 0 };

const comboboxWrapperStyles = {};

export {
  menuMultipleStyles,
  items,
  menuStyles,
  comboboxStyles,
  comboboxWrapperStyles,
  selectedItemIconStyles,
  selectedItemStyles,
  Menu,
  ControllerButton,
  Input,
  Item,
  ArrowIcon,
  XIcon,
  Label,
  css,
};
