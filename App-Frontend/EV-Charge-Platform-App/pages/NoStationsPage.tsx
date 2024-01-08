import { Text, View } from "react-native";
import CheckListSVG from "../assets/icons/checklist.svg";
import { useTranslation } from "react-i18next";

export default function NoStationsPage() {
    const { t } = useTranslation();
    return (
        <View className="flex-1 p-3 items-center justify-center dark:bg-slate-800">
            <CheckListSVG width={150} height={150} fill={'#94a3b8'} />
            <Text className="mt-8 text-xl font-semibold text-gray-800 dark:text-slate-300">{t('noStations')}</Text>
            <Text className="mt-4 px-3 text-base font-semibold text-gray-500 dark:text-slate-400 text-center">{t('supportTextStations')}</Text>
        </View>
    );
}