import styles from './Section.module.css';

const TONE_CLASS = {
  cream: styles.cream,
  surface: styles.surface,
  emerald: styles.emerald,
  ink: styles.ink,
};

function Section({
  as: Tag = 'section',
  tone = 'cream',
  dense = false,
  id,
  className,
  children,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}) {
  const toneClass = TONE_CLASS[tone] || TONE_CLASS.cream;
  const classes = [styles.section, toneClass, dense ? styles.dense : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      id={id}
      className={classes}
      data-tone={tone}
      aria-labelledby={ariaLabelledBy}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Section;
