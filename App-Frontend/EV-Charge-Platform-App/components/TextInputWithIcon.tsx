// import { styled } from 'nativewind';
import React from 'react';
import { View, TextInputProps, TextInput } from "react-native";
// import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Ionicons } from '@expo/vector-icons';

interface MyTextInputProps extends TextInputProps {
    viewClassNames: string
    iconName: React.ComponentProps<typeof Ionicons>['name']
    iconSize: number
  }

// function TextInputWithIcon({ viewClassNames, iconName, iconSize, ...props }: MyTextInputProps) {
//     return (
//         <View className={viewClassNames + 'flex-row items-center justify-center bg-green-600 p-2 mb-2'}>
//             <Ionicons name={iconName} size={iconSize}/>
//             <TextInput {...props}/>
//         </View>
//     )
// }

// export default styled(TextInputWithIcon, {
//     props: {
//         iconName: true,
//         iconSize: true,
//     }
// });

// type myProps = {

// }

type myState = {

}

export class TextInputWithIcon extends React.Component<MyTextInputProps, myState> {
    render(): React.ReactNode {
        console.log(this.props.viewClassNames);
        return (
            <View className={this.props.viewClassNames + ` flex-row items-center justify-center`}>
                <Ionicons name={this.props.iconName} size={this.props.iconSize}/>
                <TextInput {...this.props}/>
            </View>
        )
    }
}

