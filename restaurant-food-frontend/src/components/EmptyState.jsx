import React from "react";

const EmptyState = ({
    title = "No Items Found",
    description = "There are no records to display right now.",
    actionText,
    onAction
}) => {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{description}</p>
            {actionText && onAction && (
                <button className="btn btn-primary" onClick={onAction}>
                    {actionText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
