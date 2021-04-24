import React, { useEffect, useState } from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { items, comboboxStyles, comboboxWrapperStyles } from './shared';
import { Input } from '@chakra-ui/react';
import FaceIcon from '@material-ui/icons/Face';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { Avatar, Chip } from '@material-ui/core';

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
        (selectedItems.indexOf(item as never) < 0 && item.email.toLowerCase().startsWith(inputValue.toLowerCase())) ||
        item.username.toLowerCase().startsWith(inputValue.toLowerCase()),
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

  return (
    <div>
      <div style={comboboxWrapperStyles as any}>
        {selectedItems.map((selectedItem, index) => (
          <>
            <div style={{ position: 'relative' }} key={index}>
              <Chip
                avatar={<Avatar src={(selectedItem as any).profile_picture} />}
                label={(selectedItem as any).email}
                style={{ position: 'relative' }}
                clickable
                color="default"
                key={`selected-item-${index}`}
                {...getSelectedItemProps({ selectedItem, index })}
                onDelete={() => removeSelectedItem(selectedItem)}
                deleteIcon={<HighlightOffIcon />}
                variant="outlined"
              />
            </div>
          </>
        ))}
        <div style={comboboxStyles} {...getComboboxProps()}>
          <Input
            {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
            placeholder="Add Members..."
            size="lg"
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
                key={`${item.id}${index}`}
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
                {item.email}
              </li>
            ))}
      </ul>
    </div>
  );
};
