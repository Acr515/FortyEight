import React from "react";
import './style.scss';

export default function EventCodeHolder({eventCode}) {
    return (
        <span className="_EventCodeHolder">
            {eventCode}
        </span>
    )
}