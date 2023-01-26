import React from "react";
import { Link } from "react-router-dom";
import './style.scss';

/**
 * Links any element to its team number. Primarily used in simulator viewer; its functionality cannot be guaranteed outside of that screen.
 * @param {number} number The team # 
 */
export default function TeamLink({children, number, style, className}) {
    return <Link
        to={`/teams/${number}/-1/Results`}
        style={style}
        className={`${className} _TeamLink`}
    >
        {children}
    </Link>
}