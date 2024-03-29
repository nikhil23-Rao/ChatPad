import React, { useEffect, useState } from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { items, comboboxStyles, comboboxWrapperStyles } from './shared';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, Input, useToast } from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { Avatar, Chip } from '@material-ui/core';
import { CREATE_GROUP } from '@/apollo/Mutations';
import { generateId } from '@/../utils/GenerateId';
import client from '@/../apollo-client';
import { useRouter } from 'next/dist/client/router';
import { useSession } from 'next-auth/client';
import { GET_GROUPS, GET_USER_ID } from '@/apollo/Queries';
import CryptoJS from 'crypto-js';
const CHATPAD_SECURE_KEY = 'ShFSES21qHsQEqZXMxQ9zgHy+bu0=';
export function encrypt(text = '', key = CHATPAD_SECURE_KEY) {
  const message = CryptoJS.AES.encrypt(text, key);
  return message.toString();
}
export function decrypt(message = '', key = CHATPAD_SECURE_KEY) {
  var code = CryptoJS.AES.decrypt(message, key);
  var decryptedMessage = code.toString(CryptoJS.enc.Utf8);

  return decryptedMessage;
}

export const Search = () => {
  const [session] = useSession();
  const [inputValue, setInputValue] = useState<any>('');
  const [error, setError] = useState(false);
  const [image, setImage] = useState<string | any>('');
  const [nameError, setNameError] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [user, setUser] = useState<{
    username: string | null | undefined;
    email: string | null | undefined;
    id: string | null | undefined;
    profile_picture: string | null | undefined;
    dark_theme: string;
    iat?: string | null | undefined;
    online: boolean | string | undefined;
    chaton: string | null | undefined | any;
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
  const getFilteredItems = (items) => {
    const res = decrypt(items);
    if (typeof res !== 'undefined' && res !== '') {
      return JSON.parse(res).filter(
        (item) =>
          selectedItems.indexOf(item as never) < 0 &&
          item.email.toLowerCase().startsWith(inputValue.toLowerCase()) &&
          item.id !== user?.id,
      );
    } else return [];
  };
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

  const { data: groupData, loading: groupLoading } = useQuery(GET_GROUPS, { variables: { authorid: user?.id } });

  const GetMembers = () => {
    const members = [];
    for (const item in selectedItems) {
      members.push({
        username: (selectedItems[item] as any).username,
        id: (selectedItems[item] as any).id,
        email: (selectedItems[item] as any).email,
        profile_picture: (selectedItems[item] as any).profile_picture,
        online: (selectedItems[item] as any).online,
        chaton: '',
        typing: false,
      } as never);
    }
    members.push({
      username: user?.username,
      id: user?.id,
      email: user?.email,
      profile_picture: user?.profile_picture,
      online: true,
      chaton: '',
      typing: false,
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
        online: boolean;
        chaton: string | any;
        typing: boolean;
      } = {
        username: session.user.name!,
        email: session.user.email!,
        id: result.data.GetUserId[0],
        dark_theme: result.data.GetUserId[1],
        online: true,
        profile_picture: session.user.image!,
        chaton: '',
        typing: false,
      };
      setUser(currentUser);
    }
  };

  useEffect(() => {
    if (selectedItems.length > 0) {
      setError(false);
    }
    if (nameVal.length > 0) {
      setNameError(false);
    }
    GetUser();
  }, [selectedItems, error, nameError, session, groupData]);

  const reader = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.readAsDataURL(file);
    });
  };

  return (
    <>
      <input
        type="file"
        id="filepicker"
        accept="image/x-png,image/gif,image/jpeg"
        onChange={(e: any) => {
          const file = e.target.files[0];
          reader(file).then((res) => setImage(res));
        }}
        style={{ display: 'none' }}
      />
      {selectedItems.length > 1 ? (
        <div
          style={{
            position: 'relative',
            border: '3px dotted #add8e6',
            width: 160,
            height: 160,
            left: 240,
            bottom: 50,
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('filepicker')?.click()}
        >
          {image.length === 0 ? (
            <>
              <i className="fa fa-camera fa-5x" style={{ top: 40, left: 40, position: 'relative' }}></i>
              <p style={{ top: 50, left: 17, position: 'relative', fontFamily: 'Helvetica' }}>Add a group image</p>
            </>
          ) : (
            <img src={image} alt="" style={{ width: '100%', height: '100%' }} />
          )}
        </div>
      ) : null}
      <div>
        <div style={comboboxWrapperStyles as any}>
          <div style={comboboxStyles} {...getComboboxProps()}>
            <div className="mb-3 ml-5">
              <Input
                disabled={selectedItems.length <= 1 ? true : false}
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
                  <div style={{ marginTop: 8, fontWeight: 'bold' }}>{item.username}</div>
                </li>
              ))}
        </ul>
        <div className="mt-4" style={{ marginLeft: '36%' }}>
          <Button
            style={{ width: 200 }}
            colorScheme="green"
            isLoading={loading}
            onClick={async () => {
              try {
                if (groupLoading) setLoading(true);
                if (groupData) {
                  for (const group of groupData.GetGroups) {
                    if (group.members.length === 2 && selectedItems.length === 1) {
                      if (group.members[0].id.includes((selectedItems[0] as any).id))
                        return toast({
                          status: 'error',
                          title: 'You already have a DM with this person',
                          position: 'top-left',
                          isClosable: true,
                        });
                      if (group.members[1].id.includes((selectedItems[0] as any).id))
                        return toast({
                          status: 'error',
                          title: 'You already have a DM with this person',
                          position: 'top-left',
                          isClosable: true,
                        });
                    }
                  }
                }
                if (nameVal.length == 0 && selectedItems.length > 1) {
                  return setNameError(true);
                }

                if (!nameVal.replace(/\s/g, '').length && selectedItems.length > 1) {
                  return;
                }
                if (selectedItems.length === 0) {
                  return setError(true);
                }
                if (GetMembers() !== []) {
                  setLoading(true);
                  await client.mutate({
                    mutation: CREATE_GROUP,
                    variables: {
                      id: generateId(24),
                      members: GetMembers(),
                      name:
                        selectedItems.length > 1
                          ? nameVal
                          : `DM: ${user?.username} ${(selectedItems[0] as any).username}`,
                      image,
                      dm: selectedItems.length >= 2 ? false : true,
                    },
                  });
                  window.location.reload(false);
                  setLoading(false);
                } else if (GetMembers() === []) {
                  toast({ status: 'error', title: 'Oops! Something failed.' });
                }
              } catch (err) {
                console.log(err);
              }
            }}
          >
            Create Chat
          </Button>
        </div>
        {image.length !== 0 && (
          <div className="mt-2" style={{ marginLeft: '36%' }}>
            <Button colorScheme="red" style={{ width: 200 }} onClick={() => setImage('')}>
              Clear Image
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
