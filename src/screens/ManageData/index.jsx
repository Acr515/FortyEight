import React, { useContext } from "react";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import { VERSION_NAME, VERSION_NUMBER } from "../../config";
import DialogBoxContext from "../../context/DialogBoxContext";
import FeedbackModalContext from "../../context/FeedbackModalContext";
import TeamData from "../../data/TeamData";
import generateHexString from "../../util/generateHexString";
import date from 'date-and-time';
import './style.scss';

export default function ManageData() {
    const modalFunctions = useContext(FeedbackModalContext);
    const dialogFunctions = useContext(DialogBoxContext);

    return (
        <div className="SCREEN _ManageData">
            <PageHeader text="Manage Data" />
            <div className="content-area">
                <h2>Import Data</h2>
                <div className="control-area">
                    <div className="cell explanation">
                        <p>Use the input to the right to attach any number of .json files that contain match data created in FortyEight. The data will automatically populate under the Teams tab. Any duplicate matches will be automatically removed.</p>
                    </div>
                    <form className="cell">
                        <input 
                            type="file" 
                            multiple 
                            className="file-input"
                            name="file-import"
                            id="file-import"
                        />
                        <Button
                            text="Import"
                            style={{ maxWidth: 128 }}
                        />
                    </form>
                </div>

                <h2>Export Data</h2>
                <div className="control-area">
                    <div className="cell explanation">
                        <p>Click the button to the right to generate a .json file that will be downloaded to your hard drive and can be imported by other users.</p>
                    </div>
                    <div className="cell">
                        <Button
                            text="Export"
                            marginTop={1}
                            marginBottom={1}
                            style={{ maxWidth: 128 }}
                            action={() => exportData(modalFunctions.setModal)}
                        />
                    </div>
                </div>
            </div>
            
        </div>
    )
}

function exportData(modalSetter) {
    try {
        // Create a filename
        let filename = "48DATA_" + VERSION_NAME + "_" + generateHexString(8);

        // Generate object
        let exportObj = { 
            VERSION_NUM: VERSION_NUMBER,
            VERSION_STR: VERSION_NAME,
            timestamp: date.format(new Date(), "M/D/YY, h:mm A"),
            data: [] 
        };
        TeamData.forEach(team => { exportObj.data.push(team); });
        downloadObjectAsJson(exportObj, filename);
        modalSetter("The export was successful and your download should begin momentarily.", false);
    }
    catch (e) {
        console.log(e);
        modalSetter("An error occurred while exporting the data.", true);
    }
}

/**
 * Downloads a json file to the user's downloads folder.
 * @param {object} exportObj an object with data to export
 * @param {string} exportName the file name to assign to the downloaded file, do not include an extension
 */
function downloadObjectAsJson(exportObj, exportName){
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
	var downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute("href",     dataStr);
	downloadAnchorNode.setAttribute("download", exportName + ".json");
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}


/**
 * Imports data directly into the TeamData variable and saves the data.
 * 
 * @returns a data object with the # of new teams added, # of new matches added,
 * # of duplicates ignored, and any pairs of conflicting matches if they exist
 */
function importData() {

}