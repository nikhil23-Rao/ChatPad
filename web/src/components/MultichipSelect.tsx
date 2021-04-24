import React from 'react';
import { withStyles } from '@material-ui/styles';
import { TextField, Paper, MenuItem, Chip } from '@material-ui/core';
import Downshift from 'downshift';
import CancelIcon from '@material-ui/icons/Cancel';

const styles: any = (theme: any) => ({
  chipContainer: {
    backgroundColor: 'transparent',
    display: 'inline-block',
    marginBottom: 10,
  },
  chip: {
    marginTop: 10,
    marginRight: 5,
  },
  paper: {
    maxHeight: '150px',
    overflowY: 'auto',
  },
});

const renderInput = (inputProps: any) => {
  const { InputProps, classes, availableItems } = inputProps;

  const allItemSelected = 0;

  return (
    <TextField
      fullWidth
      label={allItemSelected ? 'No more character to add' : 'Choose a character'}
      disabled={allItemSelected as any}
      InputProps={{
        classes: {
          input: classes.input,
        },
        ...InputProps,
      }}
    />
  );
};

const renderChipList = (inputProps: any) => {
  const { classes, selectedItem, onRemoveItem } = inputProps;
  return (
    <div className={classes.chipContainer}>
      {selectedItem.length > 0 &&
        selectedItem.map((item: any) => (
          <Chip
            key={item}
            className={classes.chip}
            label={item}
            deleteIcon={<CancelIcon />}
            onDelete={() => onRemoveItem(item)}
            onClick={() => onRemoveItem(item)}
          />
        ))}
    </div>
  );
};

const renderSuggestion = (params: any) => {
  const { item, index, itemProps, highlightedIndex, selectedItem } = params;
  const isHighlighted = highlightedIndex === index;
  const isSelected = selectedItem.indexOf(item.name) > -1;

  return (
    !isSelected && (
      <MenuItem {...itemProps} key={item.id} selected={isHighlighted} component="div">
        {item.name}
      </MenuItem>
    )
  );
};

const getSuggestions = (inputValue: any, itemList: any) =>
  itemList.filter((item: any) => item.name.toLowerCase().includes(inputValue.toLowerCase()));

function MultiChipSelect(props: any) {
  const { classes, availableItems, onRemoveItem, ...rest } = props;

  return (
    <Downshift {...rest}>
      {({ getInputProps, getItemProps, inputValue, selectedItem, highlightedIndex, toggleMenu, isOpen }) => (
        <div>
          {renderChipList({
            classes,
            onRemoveItem,
            selectedItem,
          })}

          {renderInput({
            classes,
            selectedItem,
            availableItems,
            InputProps: {
              ...getInputProps({
                onClick: () => toggleMenu(),
              }),
            },
          })}

          {isOpen && (
            <Paper className={classes.paper} square>
              {getSuggestions(inputValue, availableItems).map((item: any, index: number) =>
                renderSuggestion({
                  item,
                  index,
                  itemProps: getItemProps({
                    item: item.name,
                  }),
                  highlightedIndex,
                  selectedItem,
                }),
              )}
            </Paper>
          )}
        </div>
      )}
    </Downshift>
  );
}

export default withStyles(styles)(MultiChipSelect);
