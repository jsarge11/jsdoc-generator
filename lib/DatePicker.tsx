import * as React from 'react';
import { FilterButton } from '../../Buttons/FilterButton/FilterButton';
import { CustomDatePickerObject, DatePickerSides, DatePickerTextObject, Dates, TimeDirection, TimeUnit } from '../PickerTypes';
import { Calendars } from './_Calendars/Calendars';
import { DatePickerFooter } from './_DatePickerFooter/DatePickerFooter';
import { Navigator } from './_Navigator/Navigator';
import { formatTime, timeTravel } from './_Util/fns';

import { throwPropErrorMessage } from '../../_XIFiles/_Util/fns';
import { Dropdown } from '../../Dropdowns/DropdownExports';
import { DivProps } from '../../types';
import { DatePickerWrapper, ModalHeader, ModalWrapper, NavigatorWrapper } from './DatePicker_SC';

export interface Props {
  /**
   * Controls whether the Filter Button is active or inactive.
   */
  isActive: boolean;
  /**
   * Controls which side the DatePicker opens on.
   */
  opens?: DatePickerSides;
  /**
   * Localization for internal DatePicker text.
   */
  textObject?: DatePickerTextObject;
  /**
   * Options for the dropdown, that allow preselected date ranges.
   */
  customOptions?: CustomDatePickerObject[];
  /**
   * Controls whether the day or month comes first in date formatting.
   */
  isDayFirst?: boolean;
  /**
   * Allows for ref passing to the wrapper component
   */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Callback that fires when bottom right bottom is clicked.
   */
  onButtonClick?(dates: Dates): void;
}

export const defaultProps = {};

const getTodaysDate = () => {
  return new Date().valueOf() * new Date().valueOf();
};

const defaultId = getTodaysDate();
const nullDates: Dates = {
  first: undefined,
  last: undefined
};

export const DatePicker: React.FC<Props & DivProps> = React.forwardRef((props: Props & DivProps, ref: React.Ref<HTMLDivElement>) => {
  const dateButtonEl = React.useRef<any>(null);
  const calenderElement = React.useRef<any>(null);
  const { onButtonClick, opens, isActive, isDayFirst, ...ingredients } = props;
  const [currId, setCurrId] = React.useState(defaultId);
  const { customOptions, textObject } = props;

  throwPropErrorMessage('DatePicker', { isActive });

  const [newCustomOptions] = React.useState(() => {
    const defaultCustomOptions = {
      title: textObject ? textObject.custom : 'Custom',
      id: defaultId,
      timeUnit: 'days' as TimeUnit,
      timeValue: 0,
      direction: 'forward' as TimeDirection
    };

    if (customOptions) {
      customOptions.unshift(defaultCustomOptions);

      return customOptions;
    } else {
      return [defaultCustomOptions];
    }
  });

  const [active, setActive] = React.useState(false);
  const [selectedDates, setSelectedDates] = React.useState<Dates>(nullDates);
  const [filterButtonWidth, setFilterButtonWidth] = React.useState(208);

  const controlVisible = () => {
    setActive((a) => !a);
  };

  React.useEffect(() => {
    setFilterButtonWidth(dateButtonEl.current.offsetWidth);
  }, [active]);

  const handleMouseClick = (e: any) => {
    if (e.target.contains(calenderElement.current)) {
      controlVisible();
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleMouseClick);

    return () => {
      document.removeEventListener('mousedown', handleMouseClick);
    };
  }, []);

  const onItemClick = (option: CustomDatePickerObject) => {
    const { timeUnit, timeValue, direction, id } = option;
    setCurrId(id);
    setSelectedDates(timeTravel(timeUnit, timeValue, direction));
    setFilterButtonWidth(dateButtonEl.current.offsetWidth);
  };

  // need this function to be passed down because it always needs to set the dates, and pass the results via props
  const generateID = () => {
    setSelectedDates(nullDates);
    setCurrId(defaultId);
  };

  const sendSelected = () => {
    let firstArr: any = [];
    let lastArr: any = [];
    if (onButtonClick) {
      controlVisible();
      if (selectedDates.last && selectedDates.first) {
        firstArr = selectedDates.first.toString().split(' ');
        lastArr = selectedDates.last.toString().split(' ');
      }

      const first = firstArr.filter((item: string, i: number) => i < 4).join(' ');
      const last = lastArr.filter((item: string, i: number) => i < 4).join(' ');

      const obj = {
        first,
        last
      };

      onButtonClick(obj);
    } else {
      console.error('No callback passed');
    }
  };

  const cancel = () => {
    controlVisible();
    setSelectedDates(nullDates);
  };

  let displayText = textObject ? textObject.select : 'Select a Date Range';
  const firstSelected = selectedDates.first;
  const lastSelected = selectedDates.last;

  if (firstSelected) {
    displayText = `${formatTime(firstSelected, isDayFirst)} - `;
  }
  if (lastSelected) {
    displayText += formatTime(lastSelected, isDayFirst);
  }

  return (
    <DatePickerWrapper {...ingredients} ref={ref}>
      <FilterButton isActive={isActive} isFocused={active} text={displayText} onClick={controlVisible} ref={dateButtonEl} />
      {active ? (
        <ModalWrapper elem={dateButtonEl} ref={calenderElement} opens={opens || 'right'} width={774} filterButtonWidth={filterButtonWidth}>
          <ModalHeader>
            <Dropdown menuObjects={newCustomOptions} onItemClick={onItemClick} placeholder='Range' />
            <NavigatorWrapper>
              <Navigator
                first
                selectedDates={selectedDates}
                setSelectedDates={setSelectedDates}
                enterDayFirst={isDayFirst}
                placeholder={isDayFirst ? 'DD/MM/YYYY' : 'MM/DD/YYYY'}
              />
              <Navigator
                selectedDates={selectedDates}
                setSelectedDates={setSelectedDates}
                enterDayFirst={isDayFirst}
                placeholder={isDayFirst ? 'DD/MM/YYYY' : 'MM/DD/YYYY'}
              />
            </NavigatorWrapper>
          </ModalHeader>
          <Calendars selectedDates={selectedDates} setSelectedDates={setSelectedDates} generateId={generateID} />
          <DatePickerFooter
            leftButton={textObject ? textObject.leftButton : 'Cancel'}
            rightButton={textObject ? textObject.rightButton : 'Apply'}
            selectedDates={selectedDates}
            cancel={cancel}
            onButtonClick={sendSelected}
          />
        </ModalWrapper>
      ) : (
        ''
      )}
    </DatePickerWrapper>
  );
});
DatePicker.defaultProps = defaultProps;
