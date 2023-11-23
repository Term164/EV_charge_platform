import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface TextWithInputTitleProps extends TextInputProps {
    title: string
    titleClassNames?: string
    innerViewClassNames?: string
    mainViewClassNames?: string
}

export class TextInputWithTitle extends React.Component<TextWithInputTitleProps> {
    render(): React.ReactNode {
        return (
            <View className={this.props.mainViewClassNames != undefined ? this.props.mainViewClassNames : ''}>
            <Text className={this.props.titleClassNames != undefined ? this.props.titleClassNames : ''}>{this.props.title}</Text>
            <View className={this.props.innerViewClassNames != undefined ? this.props.innerViewClassNames : ''}>
                <TextInput {...this.props}></TextInput>
            </View>
        </View>
        )
    }
}