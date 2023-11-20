import React from 'react';
import { View, TextInputProps, TextInput } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface MyTextInputProps extends TextInputProps {
    viewClassNames: string
    iconName: React.ComponentProps<typeof Ionicons>['name']
    iconSize: number
  }

export class TextInputWithIcon extends React.Component<MyTextInputProps> {
    render(): React.ReactNode {
        return (
            <View className={this.props.viewClassNames + ` flex-row items-center justify-center`}>
                <Ionicons name={this.props.iconName} size={this.props.iconSize}/>
                <TextInput {...this.props}/>
            </View>
        )
    }
}

