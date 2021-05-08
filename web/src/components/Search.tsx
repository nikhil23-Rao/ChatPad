import React, { useEffect, useState } from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { items, comboboxStyles, comboboxWrapperStyles } from './shared';
import { Button, Input, useToast } from '@chakra-ui/react';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { Avatar, Chip } from '@material-ui/core';
import { CREATE_GROUP } from '@/apollo/Mutations';
import { generateId } from '@/utils/GenerateId';
import client from '@/../apollo-client';
import { useRouter } from 'next/dist/client/router';
import { useSession } from 'next-auth/client';
import { GET_USER_ID } from '@/apollo/Queries';
import jwtDecode from 'jwt-decode';
import LoadingBar from 'react-top-loading-bar';

export const Search = () => {
  const [session] = useSession();
  const [inputValue, setInputValue] = useState<any>('');
  const [error, setError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [user, setUser] = useState<{
    username: string | null | undefined;
    email: string | null | undefined;
    id: string | null | undefined;
    profile_picture: string | null | undefined;
    dark_theme: string;
    iat?: string | null | undefined;
  } | null>(null);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection({ initialSelectedItems: [] });
  const getFilteredItems = (items) =>
    items.filter(
      (item) =>
        selectedItems.indexOf(item as never) < 0 &&
        item.email.toLowerCase().startsWith(inputValue.toLowerCase()) &&
        item.id !== user?.id,
    );
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    selectItem,
  } = useCombobox({
    inputValue,
    items: getFilteredItems(items),
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (selectedItem) {
            setInputValue('');
            addSelectedItem(selectedItem as never);
            selectItem(null);
          }

          break;
        default:
          break;
      }
    },
  });

  const GetMembers = () => {
    const members = [];
    for (const item in selectedItems) {
      console.log(selectedItems[item]);
      members.push({
        username: (selectedItems[item] as any).username,
        id: (selectedItems[item] as any).id,
        email: (selectedItems[item] as any).email,
        profile_picture: (selectedItems[item] as any).profile_picture,
        online: (selectedItems[item] as any).online,
      } as never);
    }
    members.push({
      username: user?.username,
      id: user?.id,
      email: user?.email,
      profile_picture: user?.profile_picture,
    } as never);
    return members;
  };

  const GetUser = async () => {
    const token = localStorage.getItem('token');
    if (session && !token) {
      const result = await client.query({ query: GET_USER_ID, variables: { email: session.user.email } });
      const currentUser: {
        username: string;
        email: string;
        id: string;
        profile_picture: string;
        dark_theme: string;
      } = {
        username: session.user.name!,
        email: session.user.email!,
        id: result.data.GetUserId[0],
        dark_theme: result.data.GetUserId[1],
        profile_picture: session.user.image!,
      };
      setUser(currentUser);
    }
    if (token) {
      const currentUser: {
        username: string;
        email: string;
        id: string;
        profile_picture: string;
        iat: string;
        oauth: boolean;
        dark_theme: string;
      } = jwtDecode(token!);
      setUser(currentUser);
    }
  };

  useEffect(() => {
    console.log('SELECTED ITEMS', selectedItems);
    if (selectedItems.length > 0) {
      setError(false);
    }
    if (nameVal.length > 0) {
      setNameError(false);
    }
    GetUser();
  }, [selectedItems, error, nameError, session]);

  return (
    <div>
      <div style={comboboxWrapperStyles as any}>
        <div style={comboboxStyles} {...getComboboxProps()}>
          <div className="mb-3 ml-5">
            <Input
              isInvalid={nameError}
              style={{ color: user?.dark_theme === 'true' ? '#fff' : '#000' }}
              placeholder="Group Name..."
              value={nameVal}
              onChange={(e) => setNameVal(e.currentTarget.value)}
              size="lg"
              color="gray.800"
              required={true}
            />

            {nameError ? <p style={{ color: '#E53E3E' }}>Please Provide A Group Name</p> : null}
          </div>
          {selectedItems.map((selectedItem, index) => (
            <React.Fragment key={(selectedItem as any).id}>
              <div style={{ position: 'relative' }}>
                <Chip
                  avatar={<Avatar src={(selectedItem as any).profile_picture} />}
                  label={(selectedItem as any).email}
                  style={{ position: 'relative', backgroundColor: user?.dark_theme === 'true' ? '#fff' : '' }}
                  clickable
                  color="default"
                  key={`selected-item-`}
                  {...getSelectedItemProps({ selectedItem, index })}
                  onDelete={() => removeSelectedItem(selectedItem)}
                  deleteIcon={<HighlightOffIcon />}
                  variant="outlined"
                />
              </div>
            </React.Fragment>
          ))}
          <Input
            {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
            placeholder="Add Members By Email..."
            isInvalid={error}
            style={{ color: user?.dark_theme === 'true' ? '#fff' : '#000' }}
            size="lg"
            required={true}
            color="gray.900"
          />
          {error ? <p style={{ color: '#E53E3E' }}>To Create A Group Please Add Members</p> : null}
        </div>
      </div>
      <ul {...getMenuProps()}>
        {isOpen &&
          getFilteredItems(items)
            .slice(0, 5)
            .map((item, index) => (
              <li
                key={`${index}`}
                className="mx-auto"
                style={{
                  fontFamily: 'Arial',
                  textAlign: 'left',
                  border: '1px solid #d4d4d4',
                  color: '#000',
                  padding: 20,
                  backgroundColor: highlightedIndex === index ? '#E3E3E3' : 'white',
                  fontWeight: 'bold',
                  width: '100%',
                  height: 70,
                  cursor: 'pointer',
                }}
                {...getItemProps({ item, index })}
              >
                <div>
                  <img
                    src={item.profile_picture}
                    style={{ width: 40, height: 40, borderRadius: 20, float: 'left', marginRight: 10 }}
                    alt=""
                  />
                </div>
                <div style={{ marginTop: 8, fontWeight: 'bold' }}>{item.email}</div>
              </li>
            ))}
      </ul>
      <div className="mt-4" style={{ marginLeft: '36%' }}>
        <Button
          colorScheme="green"
          isLoading={loading}
          onClick={async () => {
            try {
              if (nameVal.length == 0) {
                return setNameError(true);
              }
              if (selectedItems.length === 0) {
                return setError(true);
              }
              if (GetMembers() !== []) {
                setLoading(true);
                await client.mutate({
                  mutation: CREATE_GROUP,
                  variables: { id: generateId(24), members: GetMembers(), name: nameVal },
                });
                setLoading(false);
                router.reload();
              } else if (GetMembers() === []) {
                toast({ status: 'error', title: 'Oops! Something failed.' });
              }
            } catch (err) {
              console.log(err);
            }
          }}
        >
          Create Group
        </Button>
      </div>
    </div>
  );
};
