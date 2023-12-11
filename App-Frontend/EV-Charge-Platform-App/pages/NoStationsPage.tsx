import { Text, View } from "react-native";
import CheckListSVG from "../assets/icons/checklist.svg";

export default function NoStationsPage() {
    return (
        <View className="flex-1 p-3 items-center justify-center">
            <CheckListSVG width={150} height={150} fill={'#94a3b8'} />
            <Text className="mt-8 text-xl font-semibold text-gray-800">No Stations Found</Text>
            <Text className="mt-4 px-3 text-base font-semibold text-gray-500 text-center">Your account setup is incomplete. Please contact your company administrator or building administrator for assistance.</Text>
        </View>
    );
}