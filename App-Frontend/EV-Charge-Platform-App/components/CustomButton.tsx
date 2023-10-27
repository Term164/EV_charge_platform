import { styled } from 'nativewind';
import React from 'react';
import { Text, Pressable, PressableProps, TextProps, PressableAndroidRippleConfig } from "react-native";
import { Colors } from 'react-native/Libraries/NewAppScreen';

interface MyButtonProps extends PressableProps {
    textStyle: TextProps["style"],
  }

function CustomButton({ textStyle, children, ...props }: MyButtonProps) {
    return(
        <Pressable {...props}>
            <Text style={textStyle}><>{children}</></Text>    
        </Pressable>
    )
}

export default styled(CustomButton, {
    props: {
        textStyle: true
    }
});