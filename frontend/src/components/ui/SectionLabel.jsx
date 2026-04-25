import React from 'react';

/**
 * SectionLabel — supermemory.ai pattern
 * Renders: SECTION NAME (left) ——————— [1/6] (right)
 */
const SectionLabel = ({ label, page, total }) => {
  return (
    <div className="section-label-bar">
      <span className="section-label-text">{label}</span>
      {page && total && (
        <span className="section-label-page">[{page}/{total}]</span>
      )}
    </div>
  );
};

export default SectionLabel;
