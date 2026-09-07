import { useEffect, useState } from "react";

/**
 * Global loading indicator driven by the axios request
 * counter in services/api.js. Shows a thin progress bar and
 * a small pill while any API request is in flight, so pages
 * never look frozen while data loads from the remote database.
 */
export default function RequestActivityIndicator() {
    const [pending, setPending] = useState(0);

    useEffect(() => {
        const onActivity = (event) => {
            setPending(event.detail?.pending || 0);
        };

        window.addEventListener("api-activity", onActivity);

        return () => {
            window.removeEventListener("api-activity", onActivity);
        };
    }, []);

    if (pending === 0) return null;

    return (
        <>
            <div className="request-progress-bar" aria-hidden="true" />
            <div className="request-progress-pill" role="status">
                <span className="request-progress-spinner" aria-hidden="true" />
                Loading data…
            </div>
        </>
    );
}
