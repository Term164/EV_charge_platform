import React from 'react';
import { View, TextInputProps, TextInput } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface MyTextInputProps extends TextInputProps {
    viewClassNames: string
    iconName: React.ComponentProps<typeof Ionicons>['name']
    iconSize: number
    front: boolean
  }

export class TextInputWithIcon extends React.Component<MyTextInputProps> {
    static defaultProps = {
        front: true
      }

    render(): React.ReactNode {
        return (
            <View className={this.props.viewClassNames + ` flex-row items-center justify-center`}>
                {this.props.front ? <Ionicons name={this.props.iconName} size={this.props.iconSize}/> : <></>}
                <TextInput {...this.props}/>
                {!this.props.front ? <Ionicons name={this.props.iconName} size={this.props.iconSize}/> : <></>}
            </View>
        )
    }
}

