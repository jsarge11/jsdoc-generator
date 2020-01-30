import * as React from 'react';
import { checkIfButtonTypeIsValid, getPrimary, hexToRgb, throwPropErrorMessage } from '../../_XIFiles/_Util/fns';
import { XIColors, XIColorUsage } from '../../_XIFiles/XIColors';
import { _ButtonInputType } from '../../TextFields/InputTypes';
import { ToolTipWrapper } from '../../ToolTips/_ToolTipWrapper/ToolTipWrapper';
import { Direction } from '../../ToolTips/ToolTipTypes';
import { ButtonProps, CloudsNColors, ErrorStates } from '../../types';
import { Icons } from '../../Visuals/VisualTypes';
import { XIIcon } from '../../Visuals/XIIcon/XIIcon';
import { getPrimaryColor } from '../_Util/fns';
import { ButtonSizes, ButtonTypes } from '../ButtonTypes';
import { DisabledButtonWrapper, NoFillButtonWrapper, NormalButtonWrapper, OutlineButtonWrapper, TextButtonWrapper } from './DefaultButton_SC';

const { orca, white } = XIColors;
const { disabledState } = XIColorUsage;

export interface Props {
  /**
   * Changes the fill type of the button.
   */
  fill: ButtonTypes;
  /**
   * Controls of it's a large or small button.
   */
  size: ButtonSizes;
  /**
   * Changes the color fill of the button.
   */
  color?: CloudsNColors | ErrorStates;
  /**
   * Text to display in the center of the button.
   */
  text?: string;
  /**
   * Controls whether or not shadows exist on the button.
   */
  hasShadows?: boolean;
  /**
   * Controls which icon is present on the icon.
   */
  icon?: Icons;
  /**
   * Text for the tooltip to display.
   */
  toolTipText?: string;
  /**
   * Changes which direction the tooltip extends to.
   */
  toolTipDirection?: Direction;
  /**
   * Controls max-width of tooltip (in px).
   */
  toolTipMaxWidth?: number;
  /**
   * Controls which side the icon lives on.
   */
  isIconLeft?: boolean;
  /**
   * Override for text color, in the format of a string.
   */
  _textHex?: string;
  /**
   * Allows for ref passing to the wrapper component
   */
  ref?: React.Ref<HTMLButtonElement>;
}

export const DefaultButton: React.FC<Props & ButtonProps> = React.forwardRef((props: Props & ButtonProps, ref: React.Ref<HTMLButtonElement>) => {
  const {
    fill,
    text,
    color,
    size,
    icon,
    isIconLeft,
    hasShadows,
    toolTipText,
    toolTipDirection,
    toolTipMaxWidth,
    disabled,
    tabIndex,
    _textHex,
    type,
    ...ingredients
  } = props;

  /**
   * Error Messages for Required Props
   */
  const active = checkIfButtonTypeIsValid('DefaultButton', type);
  throwPropErrorMessage('DefaultButton', { fill, size });

  let textColor = getPrimaryColor(color || 'orca');
  let button = <button />;

  if (disabled) {
    textColor = disabledState;
  } else if (fill === 'no-fill' || fill === 'fill') {
    let colorHex = orca.primary;

    colorHex = color === 'success' || color === 'warning' || color === 'error' ? XIColorUsage[color] : getPrimary(color || 'orca');

    const rgb = hexToRgb(colorHex);

    if (rgb) {
      const totalRGBValue = rgb.r + rgb.g + rgb.b;
      textColor = totalRGBValue < 700 ? white.primary : orca.primary;
    }
  }

  const insertIconIfExists = () => {
    if (icon && size !== 'small') {
      return (
        <React.Fragment>
          {isIconLeft ? (
            <React.Fragment>
              <div style={{ paddingRight: '6px', pointerEvents: 'none' }}>
                <XIIcon hex={disabled ? 'white' : textColor} icon={icon} size={24} />
              </div>
              {text}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {text}
              <div style={{ paddingLeft: '6px', pointerEvents: 'none' }}>
                <XIIcon hex={disabled ? 'white' : textColor} icon={icon} size={24} />
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      );
    } else {
      return <React.Fragment>{text}</React.Fragment>;
    }
  };

  if (disabled) {
    button = (
      <DisabledButtonWrapper
        textColor={orca.primary}
        isIconLeft={isIconLeft ? isIconLeft : false}
        icon={icon}
        size={size}
        backgroundColor={color || 'orca'}
        shadows={hasShadows || false}
        type={active ? type : undefined}
        disabled
      >
        {insertIconIfExists()}
      </DisabledButtonWrapper>
    );
  } else {
    const textHexOverride = !!_textHex;
    switch (fill) {
      case 'no-fill':
        button = (
          <NoFillButtonWrapper
            textColor={_textHex || textColor}
            isIconLeft={isIconLeft ? isIconLeft : false}
            icon={icon}
            size={size}
            backgroundColor={color || 'orca'}
            shadows={hasShadows || false}
            textHexOverride={textHexOverride}
            tabIndex={tabIndex || 0}
            type={active ? type : undefined}
            {...ingredients}
            ref={ref}
          >
            {insertIconIfExists()}
          </NoFillButtonWrapper>
        );
        break;
      case 'outline':
        button = (
          <OutlineButtonWrapper
            textColor={_textHex || textColor}
            isIconLeft={isIconLeft ? isIconLeft : false}
            icon={icon}
            size={size}
            backgroundColor={color || 'orca'}
            shadows={hasShadows || false}
            textHexOverride={textHexOverride}
            tabIndex={tabIndex || 0}
            type={active ? type : undefined}
            {...ingredients}
            ref={ref}
          >
            {insertIconIfExists()}
          </OutlineButtonWrapper>
        );
        break;
      case 'text':
        button = (
          <TextButtonWrapper
            textColor={_textHex || textColor}
            isIconLeft={isIconLeft ? isIconLeft : false}
            icon={icon}
            size={size}
            backgroundColor={color || 'orca'}
            shadows={hasShadows || false}
            textHexOverride={textHexOverride}
            tabIndex={tabIndex || 0}
            type={active ? type : undefined}
            {...ingredients}
            ref={ref}
          >
            {insertIconIfExists()}
          </TextButtonWrapper>
        );
        break;
      default:
        button = (
          <NormalButtonWrapper
            textColor={_textHex || textColor}
            isIconLeft={isIconLeft ? isIconLeft : false}
            icon={icon}
            size={size}
            backgroundColor={color || 'orca'}
            shadows={hasShadows || false}
            textHexOverride={textHexOverride}
            tabIndex={tabIndex || 0}
            type={active ? type : undefined}
            {...ingredients}
            ref={ref}
          >
            {insertIconIfExists()}
          </NormalButtonWrapper>
        );
        break;
    }
  }

  const renderButton =
    disabled || !toolTipText ? (
      button
    ) : (
      <ToolTipWrapper toolTipText={toolTipText} direction={toolTipDirection} maxWidth={toolTipMaxWidth}>
        {button}
      </ToolTipWrapper>
    );

  return <React.Fragment>{renderButton}</React.Fragment>;
});
