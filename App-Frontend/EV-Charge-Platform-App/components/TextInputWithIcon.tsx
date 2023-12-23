import React from 'react';
import { View, TextInputProps, TextInput, Pressable, GestureResponderEvent } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useCurrentSettings } from '../utils/GlobalStateContext';

interface MyTextInputProps extends TextInputProps {
    viewClassNames: string
    iconName?: React.ComponentProps<typeof Ionicons>['name']
    iconSize?: number
    iconColor?: string
    iconBackName?: React.ComponentProps<typeof Ionicons>['name']
    iconBackSize?: number
    iconBackColor?: string
    iconBackPressable?: boolean
    onIconBackPress?: ((event: GestureResponderEvent) => void) | null | undefined;
  }

export class TextInputWithIcon extends React.Component<MyTextInputProps> {
    static defaultProps = {
        front: true
      }

    render(): React.ReactNode {

        let backIcon = <></>;

        if (this.props.iconBackPressable && this.props.iconBackName) {
            backIcon = <Pressable onPress={this.props.onIconBackPress}>
                            <Ionicons name={this.props.iconBackName} size={this.props.iconBackSize} color={this.props.iconBackColor}/>
                        </Pressable>
        } else if (!this.props.iconBackPressable && this.props.iconBackName) {
            backIcon = <Ionicons name={this.props.iconBackName} size={this.props.iconBackSize} color={this.props.iconBackColor}/>;
        }

        return (
            <View className={this.props.viewClassNames + ` flex-row items-center justify-center`}>
                {this.props.iconName ? <Ionicons name={this.props.iconName} size={this.props.iconSize} color={this.props.iconColor} /> : <></>}
                <TextInput {...this.props}/>
                {backIcon}
            </View>
        )
    }
}

