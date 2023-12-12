import React from 'react';
import { View, TextInputProps, TextInput } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useCurrentSettings } from '../utils/GlobalStateContext';

interface MyTextInputProps extends TextInputProps {
    viewClassNames: string
    iconName: React.ComponentProps<typeof Ionicons>['name']
    iconSize: number
    iconColor: string,
    front: boolean
  }

export class TextInputWithIcon extends React.Component<MyTextInputProps> {
    static defaultProps = {
        front: true
      }

    render(): React.ReactNode {
        return (
            <View className={this.props.viewClassNames + ` flex-row items-center justify-center`}>
                {this.props.front ? <Ionicons name={this.props.iconName} size={this.props.iconSize} color={this.props.iconColor} /> : <></>}
                <TextInput {...this.props}/>
            </View>
        )
    }
}

