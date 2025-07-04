import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import LabelColorPicker from 'view/components/LabelPanel/LabelColorPicker';

const colorsLength = 31; // Total number of colors including 'default'

test('render color picker', () => {
  const onSelectColor = jest.fn();

  const { container, queryByText } = render(<LabelColorPicker color="grayDark" onSelectColor={onSelectColor} />);

  expect(container.querySelectorAll('a').length).toBe(colorsLength);
  
  expect(container.querySelectorAll('a')[0].querySelector('svg[data-icon="check"]')).toBeTruthy();

  fireEvent.click(container.querySelectorAll('a')[0]);
  fireEvent.click(container.querySelectorAll('a')[1]);
  fireEvent.click(container.querySelectorAll('a')[2]);

  expect(onSelectColor).toHaveBeenCalledTimes(3);

  expect(queryByText('Sem cores.')).toBeTruthy();
  expect(queryByText('Isso não aparecerá na frente dos cartões.')).toBeTruthy();
});

test('render color picker with no color', () => {
  const onSelectColor = jest.fn();
  const { container } = render(<LabelColorPicker onSelectColor={onSelectColor} />);
  expect(container.querySelectorAll('a').length).toBe(colorsLength);
  expect(container.querySelectorAll('a')[colorsLength-1].querySelector('svg[data-icon="check"]')).toBeTruthy();
});
