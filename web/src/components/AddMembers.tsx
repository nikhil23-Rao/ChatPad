import React, { useEffect, useState } from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { items, comboboxStyles, comboboxWrapperStyles } from './shared';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, Input, useToast } from '@chakra-ui/react';
import { useMutation, useQuery } from '@apollo/client';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { Avatar, Chip } from '@material-ui/core';
import { ADD_MEMBERS, CREATE_GROUP, SEND_MESSAGE } from '@/apollo/Mutations';
import { generateId } from '@/../utils/GenerateId';
import client from '@/../apollo-client';
import { useRouter } from 'next/dist/client/router';
import { useSession } from 'next-auth/client';
import { GET_GROUPS, GET_GROUP_NAME, GET_USER_ID } from '@/apollo/Queries';
import { formatAMPM } from '@/../utils/formatTime';
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

export const AddMembers = () => {
  const [session] = useSession();
  const [inputValue, setInputValue] = useState<any>('');
  const [error, setError] = useState(false);
  const [image, setImage] = useState<string | any>('');
  const [nameError, setNameError] = useState(false);
  const [nameVal, setNameVal] = useState('barf');
  const [peopleAdded, setPeopleAdded] = useState('');
  const [groupSelected, setGroupSelected] = useState('');
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
  const { data: GroupNameData, loading: GroupNameLoading, refetch: groupNameRefetch } = useQuery(GET_GROUP_NAME, {
    variables: { groupid: groupSelected },
  });
  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection({ initialSelectedItems: [] });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGroupSelected(window.location.href.substring(window.location.href.lastIndexOf('/') + 1));
    }
  }, [typeof window]);
  const getFilteredItems: any = (items) => {
    if (typeof GroupNameData !== 'undefined') {
      const ids = [];
      for (const member of GroupNameData.GetGroupName.members) {
        ids.push(member.id as never);
      }
      const res = decrypt(items);
      if (typeof res !== 'undefined' && res !== '') {
        return JSON.parse(res).filter(
          (item) =>
            selectedItems.indexOf(item as never) < 0 &&
            item.email.toLowerCase().startsWith(inputValue.toLowerCase()) &&
            !ids.includes(item.id as never),
        );
      } else return [];
    }
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

  useEffect(() => {
    GetMembers();
    if (GetMembers().length !== 0) {
      for (const member of GetMembers()) {
        setPeopleAdded(`${peopleAdded.trim() ? `${peopleAdded},` : ''} ${(member as any).username}`);
      }
    }
  }, [selectedItems]);

  const { data: groupData, loading: groupLoading } = useQuery(GET_GROUPS, { variables: { authorid: user?.id } });
  const [AddMembers] = useMutation(ADD_MEMBERS);
  const [SendMessage] = useMutation(SEND_MESSAGE);

  var today: any = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var day = days[new Date().getDay()];

  today = mm + '/' + dd + '/' + yyyy;

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
    console.log('MEMBERS', members);
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
        chaton: result.data.GetUserId[3],
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
      <div>
        <div style={comboboxWrapperStyles as any}>
          <div style={comboboxStyles} {...getComboboxProps()}>
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
            {error ? <p style={{ color: '#E53E3E' }}>Please Add Members</p> : null}
          </div>
        </div>
        <ul {...getMenuProps()}>
          {isOpen &&
            getFilteredItems(items)
              .slice(0, 3)
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
        <div className="mt-4" style={{ marginLeft: '26%', marginBottom: 80, position: 'relative', top: 10 }}>
          <Button
            style={{ width: 200 }}
            colorScheme="green"
            isLoading={loading}
            onClick={async () => {
              try {
                if (groupLoading) setLoading(true);

                if (selectedItems.length === 0) {
                  return setError(true);
                }
                if (GetMembers() !== [] && typeof window !== 'undefined') {
                  try {
                    setLoading(true);
                    try {
                      await AddMembers({
                        variables: {
                          members: GetMembers(),
                          groupid: window.location.href.substring(window.location.href.lastIndexOf('/') + 1),
                        },
                      });
                      await AddMembers({
                        variables: {
                          members: GetMembers(),
                          groupid: window.location.href.substring(window.location.href.lastIndexOf('/') + 1),
                        },
                      });
                      await AddMembers({
                        variables: {
                          members: GetMembers(),
                          groupid: window.location.href.substring(window.location.href.lastIndexOf('/') + 1),
                        },
                      });
                      await AddMembers({
                        variables: {
                          members: GetMembers(),
                          groupid: window.location.href.substring(window.location.href.lastIndexOf('/') + 1),
                        },
                      });
                    } catch (err) {
                      console.log(err);
                    }

                    await SendMessage({
                      variables: {
                        groupid: window.location.href.substring(window.location.href.lastIndexOf('/') + 1),
                        body: `added ${peopleAdded}`,
                        author: {
                          username: user?.username,
                          email: user?.email,
                          id: user?.id,
                          profile_picture: user?.profile_picture,
                        },
                        image: false,
                        messageid: generateId(24),
                        time: formatAMPM(new Date()),
                        date: today,
                        day,
                        alert: true,
                      },
                    });
                    // window.location.reload(false);
                    setLoading(false);
                  } catch (err) {
                    toast({ status: 'error', title: 'Oops! Something failed.' });
                  }
                } else if (GetMembers() === []) {
                  toast({ status: 'error', title: 'Oops! Something failed.' });
                }
              } catch (err) {
                console.log(err);
              }
            }}
          >
            Add Members
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
