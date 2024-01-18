import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import date from 'date-and-time';
import Button from "components/Button";
import PageHeader from "components/PageHeader";
import Input from "components/Input";
import DialogBoxContext from "context/DialogBoxContext";
import FeedbackModalContext from "context/FeedbackModalContext";
import TeamData, { createTeamObject } from "data/TeamData";
import { getTeamData, teamExists } from "data/SearchData";
import { saveData } from "data/saveLoadData";
import generateHexString from "util/generateHexString";
import verifyVersionNumbers from "util/verifyVersionNumbers";
import hitTBA from "util/hitTBA";
import { VERSION_NAME, VERSION_NUMBER } from "../../config";
import './style.scss';

export default function ManageData() {
    const modalFunctions = useContext(FeedbackModalContext);
    const dialogFunctions = useContext(DialogBoxContext);
    const navigate = useNavigate();

    const getTBASchedule = eventCode => {
        hitTBA("event/" + eventCode + "/matches/simple", data => {
            let matches = [];
            data.forEach(match => {
                if (match.comp_level == "qm") {
                    matches.push({
                        n: match.match_number,
                        b: match.alliances.blue.team_keys.map(str => Number(str.substr(3))),
                        r: match.alliances.red.team_keys.map(str => Number(str.substr(3))),
                    });
                }
            });
            let existingSchedules = [];
            if (localStorage.getItem("schedules") !== null) existingSchedules = JSON.parse(localStorage.getItem("schedules"));
            existingSchedules.push({ code: eventCode, matches });
            localStorage.setItem("schedules", JSON.stringify(existingSchedules));
            
            modalFunctions.setModal("Schedule downloaded successfully!");
        }, () => {
            modalFunctions.setModal("Failed to reach The Blue Alliance. Check the console for details.", true);
        })
    }

    const deleteAllSchedules = () => {
        dialogFunctions.setDialog({
            body: "Any schedules in memory will be removed. They can easily be redownloaded using the controls above. Would you like to continue?",
            useConfirmation: true,
            confirmFunction: () => {
                localStorage.removeItem("schedules");
                modalFunctions.setModal("Deleted all schedules.", false);
            }
        });
    }

    return (
        <div className="SCREEN _ManageData">
            <PageHeader text="Manage Data" />
            <div className="content-area">
                <h2>Import Data</h2>
                <div className="control-area">
                    <div className="cell explanation">
                        <p>Use the input to the right to attach any number of .json files that contain match data created in FortyEight. The data will automatically populate under the Teams tab. Any duplicate matches will be automatically removed.</p>
                    </div>
                    <form className="cell" action="" id="import-form">
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
                            action={ () => { importData(modalFunctions.setModal, dialogFunctions.setDialog, navigate) } }
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

                <h2>Delete Data</h2>
                <div className="control-area">
                    <div className="cell explanation">
                        <p>Click the button to the right to delete all teams currently stored in memory. Be sure to export the data of any team information you wish to save, as this cannot be undone!</p>
                    </div>
                    <div className="cell">
                        <Button
                            text="Delete"
                            marginTop={1}
                            marginBottom={1}
                            style={{ maxWidth: 128 }}
                            action={ () => deleteData(modalFunctions.setModal, dialogFunctions.setDialog) }
                        />
                    </div>
                </div>

                <h2>Download Schedule from TBA</h2>
                <div className="control-area">
                    <div className="cell explanation">
                        <p>Using the controls on the right, you can download a qualification match schedule for a full event that will allow you to simulate any of its matches simply by typing in its match number.</p>
                    </div>
                    <div className="cell">
                        <Input
                            label="Event Code"
                            id="tba-event-code"
                        />
                        <Button
                            text="Download"
                            marginTop={1}
                            marginBottom={1}
                            style={{ maxWidth: 128 }}
                            action={ () => getTBASchedule(document.getElementById("tba-event-code").value) }
                        />
                        <Button
                            text="Delete All"
                            marginTop={12}
                            useBorder={true}
                            style={{ maxWidth: 128 }}
                            action={ deleteAllSchedules }
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


function deleteData(modalSetter, dialogSetter) {
    dialogSetter({
        body: "This will delete all data from your current working set. To undo this, export your current data for import later. Are you sure you would like to proceed?",
        useConfirmation: true,
        confirmLabel: "Yes",
        confirmFunction: () => {
            TeamData.splice(0, TeamData.length);
            saveData();
            modalSetter("Success.", false);
        }
    })
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
 * @returns a data object with a boolean for success, the # of invalid files found, # of new teams 
 * added, # of new matches added, # of duplicates ignored, and any pairs of 
 * conflicting matches if they exist.
 */
function importData(modalSetter, dialogSetter, navigate) {
    let fileBatch = document.getElementById("file-import");
    
    if (!'files' in fileBatch || fileBatch.files.length == 0) {
        modalSetter("You did not attach any files. Please try again.", true);
        return;
    }

    // Iterate through each file
    let promises = [];
    for (let file of fileBatch.files) {
        let filePromise = new Promise(resolve => {
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => resolve(reader.result);
        });
        promises.push(filePromise);
    }
    Promise.all(promises).then(fileContents => {
        let invalidFiles = 0, newTeams = 0, newMatches = 0, softDuplicates = [], hardDuplicates = 0, staleMatches = 0;
        for (let i = 0; i < fileContents.length; i ++) {
            let file = fileContents[i];
            console.log(file)
            if (file.includes("VERSION_NUM") && file.includes("VERSION_STR")) {
                // Parse an individual file
                try {
                    let fileData = JSON.parse(file);
                    // Check to make sure this version is compatible
                    if (verifyVersionNumbers(fileData.VERSION_NUM, VERSION_NUMBER)) {
                        // File is OK, begin parsing by team

                        fileData.data.forEach(team => {
                            if (teamExists(team.number)) {
                                // Must check each match against existing data for this team
                                team.data.forEach(match => {
                                    let isDuplicate = false;
                                    if (!verifyVersionNumbers(match.vnum, VERSION_NUMBER)) staleMatches ++; else {
                                        getTeamData(team.number).data.forEach(existingMatch => {
                                            if (existingMatch.id == match.id) {
                                                // This is a HARD duplicate because this form has the same ID as the other
                                                hardDuplicates ++;
                                                isDuplicate = true;
                                                return;
                                            }
                                            if (existingMatch.eventCode == match.eventCode && existingMatch.matchNumber == match.matchNumber) {
                                                // This is a SOFT duplicate because there are two different recollections of the same match.
                                                // Don't set `isDuplicate` flag because we still want to add it to the data
                                                softDuplicates.push({ existing: existingMatch, incoming: match });
                                                return;
                                            }
                                        });
                                        // Not a duplicate; add it to the data
                                        if (!isDuplicate) {
                                            newMatches ++;
                                            getTeamData(team.number).data.push(match);
                                        }
                                    }
                                });
                            } else {
                                // This is a new team, so no need to check for duplicates
                                newTeams ++;
                                let newTeam = createTeamObject(team.number);
                                Object.keys(team).forEach(key => {
                                    if (key != "data" && key != "number") newTeam[key] = team[key];
                                });
                                team.data.forEach(match => {
                                    if (verifyVersionNumbers(match.vnum, VERSION_NUMBER)) {
                                        // First check to see if there's a soft duplicate in the set that's been imported already
                                        newTeam.data.every(existingMatch => {
                                            if (existingMatch.eventCode == match.eventCode && existingMatch.matchNumber == match.matchNumber) {
                                                softDuplicates.push({ existing: existingMatch, incoming: match });
                                                return false;
                                            }
                                            return true;
                                        });
                                        newTeam.data.push(match); 
                                        newMatches ++;
                                    } else staleMatches ++;
                                });
                                TeamData.push(newTeam);
                            }
                        });

                    } else invalidFiles ++;
                }
                catch (e) {
                    modalSetter("The files you provided failed to import. Please check the console and try again.", true)
                    console.log(e);
                    console.log("Error occurred while parsing the following file:", file);
                    invalidFiles ++;
                }

                // Pull up a dialog box, the operation was successful
                if (softDuplicates.length == 0) dialogSetter({ 
                    body: `Import was successful. Click OK to continue or Cancel to abort the import.\n\nTeams added: ${newTeams}, Matches added: ${newMatches}, Duplicates ignored: ${hardDuplicates}\n\nInvalid files: ${invalidFiles}, Stale matches: ${staleMatches}.`,
                    useConfirmation: true,
                    confirmFunction: () => {
                        saveData();
                        navigate("/teams");
                    },
                    cancelFunction: () => {
                        location.reload();
                    }
                }); else {
                    // Ask if user wants to address soft duplicates
                    dialogSetter({ 
                        body: `You have ${softDuplicates.length} duplicates to address because two different forms were submitted for the same team, match, and event. Click OK to address the conflicts or Cancel to abort the import.\n\nTeams added: ${newTeams}, Matches added: ${newMatches}, Duplicates ignored: ${hardDuplicates}\n\nInvalid files: ${invalidFiles}, Stale matches: ${staleMatches}.`,
                        useConfirmation: true,
                        confirmFunction: () => {
                            saveData();
                            navigate("/conflicts", { state: { softDuplicates } });
                        },
                        cancelFunction: () => {
                            location.reload();
                        }
                    });
                }
                fileBatch.files = null;
            } else {
                // This is not a valid file
                invalidFiles ++;
            }
        }
    });

    //modalSetter("Cleared checks successfully", false);
}