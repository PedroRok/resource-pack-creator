
import { FileData } from "@/libs/packdata";
import { getVersion } from "@/libs/packversions";
import { AutoTextSize } from "auto-text-size";

export default function PackInfo({ packData, packName }: { packData: FileData[], packName: string }) {
    if (packData.length < 1) return null;

    const packImg = packData[1];

    return (
        <div className="flex">
            {packImg && (
                <img
                    className="rounded-xl size-fit max-h-[4.2rem] min-h-[4.2rem]"
                    src={`data:image/png;base64,${packImg.imageData}`}
                />
            )}
            <div className="ml-2 mt-2 border-b-2 mb-2 flex flex-col">
                <AutoTextSize mode="oneline" maxFontSizePx={18}>
                    {packName}
                </AutoTextSize>
                <p className="text-sm">
                    Pack Version: {getVersion(packData[0].jsonData.pack.pack_format)}
                </p>
            </div>
        </div>
    );
}
