import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { useTheme } from 'solid-styled-components';

export interface SuccessIconProps extends Styleable {
    fill?: Property.Color;
}

export const SuccessIcon: Component<SuccessIconProps> = props => {
    const theme = useTheme();
    const fill = (): string => props.fill || theme.colors.icon.success;

    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class={props.class}
        >
            <circle cx="12" cy="12" r="11" fill={fill()} />
            <path
                d="M7.5 13L10 15.5L16.5 9"
                stroke={theme.colors.constant.white}
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    );
};
