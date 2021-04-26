import React, { useEffect, useState } from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { items, comboboxStyles, comboboxWrapperStyles } from './shared';
import { Button, Input } from '@chakra-ui/react';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { Avatar, Chip } from '@material-ui/core';
import { CREATE_GROUP } from '@/apollo/Mutations';
import { generateId } from '@/utils/GenerateId';
import client from '@/../apollo-client';
import { useRouter } from 'next/dist/client/router';

export const Search = () => {
  const [inputValue, setInputValue] = useState<any>('');
  const [error, setError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [nameVal, setNameVal] = useState('');
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
        selectedItems.indexOf(item as never) < 0 && item.email.toLowerCase().startsWith(inputValue.toLowerCase()),
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

  const memberIds = [];

  const GetMemberIds = () => {
    for (const item in selectedItems) {
      memberIds.push({
        username: (selectedItems[item] as any).username,
        id: (selectedItems[item] as any).id,
        email: (selectedItems[item] as any).email,
        profile_picture: (selectedItems[item] as any).profile_picture,
      });
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
    GetMemberIds();
  }, [selectedItems, error, nameError]);

  return (
    <div>
      <div style={comboboxWrapperStyles as any}>
        <div style={comboboxStyles} {...getComboboxProps()}>
          <div className="mb-3 ml-5">
            <Input
              isInvalid={nameError}
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
                  style={{ position: 'relative' }}
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
              setLoading(true);
              await client.mutate({
                mutation: CREATE_GROUP,
                variables: { id: generateId(24), members: memberIds, name: nameVal },
              });
              setLoading(false);
              router.reload();
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
