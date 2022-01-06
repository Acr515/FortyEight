import React from "react";

export default function ViewIndividualData({data}) {
    // Displays a breakdown of all given data in form

    return (
        <div>
            {data.performance.pieces}
        </div>
    )
}