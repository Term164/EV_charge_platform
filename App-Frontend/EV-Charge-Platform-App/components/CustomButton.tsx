import { styled } from 'nativewind';
import React from 'react';
import { Text, Pressable, PressableProps, TextProps, PressableAndroidRippleConfig } from "react-native";

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