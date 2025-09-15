import React from "react";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="section">
    <h2 className="section__title">{title}</h2>
    <div className="section__content">{children}</div>
  </section>
);

export default Section;
