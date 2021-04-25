import React, { useEffect, useState } from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { items, comboboxStyles, comboboxWrapperStyles } from './shared';
import { Button, Input } from '@chakra-ui/react';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { Avatar, Chip } from '@material-ui/core';
import { MemberContext } from '@/../context/members';
import { CREATE_GROUP } from '@/apollo/Mutations';
import { generateId } from '@/utils/GenerateId';
import client from '@/../apollo-client';

export const Search = () => {
  const [inputValue, setInputValue] = useState<any>('');
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
      memberIds.push(selectedItems[item].id as never);
    }
  };

  useEffect(() => {
    console.log(selectedItems);
    GetMemberIds();
  }, [selectedItems]);

  return (
    <div>
      <div style={comboboxWrapperStyles as any}>
        <div style={comboboxStyles} {...getComboboxProps()}>
          <div className="mb-3 ml-5">
            <Input placeholder="Group Name..." size="lg" color="gray.800" required={true} />
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
            size="lg"
            required={true}
            color="gray.900"
          />
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
          onClick={async () => {
            try {
              await client.mutate({
                mutation: CREATE_GROUP,
                variables: { id: generateId(24), members: memberIds },
              });
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
