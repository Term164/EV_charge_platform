import { SafeAreaView } from "react-native-safe-area-context";
import ToggleSwitch from "toggle-switch-react-native";
import { useState } from 'react';
import DropDownPicker from "react-native-dropdown-picker";
import SloveniaIcon from "../assets/flag-icons/slovenia.svg";
import UKIcon from "../assets/flag-icons/united-kingdom.svg";


export default function SignInScreen() {
    const [darkMode, setDarkMode] = useState(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        {label: 'English', value: 'english', icon: () => <UKIcon width={30} height={30} />},
        {label: 'Slovensko', value: 'slovensko', icon: () => <SloveniaIcon width={30} height={30} />}
    ]);

    return (
        <SafeAreaView>
            <ToggleSwitch
                
                isOn={darkMode}
                onColor={'#3b82f6'}
                offColor={'#9ca3af'}
                label="Dark mode"
                onToggle={isOn => {setDarkMode(isOn)}}
            />

            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
            />
        </SafeAreaView>
    )
}