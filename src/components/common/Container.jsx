import MuiContainer from '@mui/material/Container';

function Container({ maxWidth = 'lg', gutter = false, sx, children, ...rest }) {
  const gutterSx = gutter ? { px: { xs: 2, md: 4 } } : null;
  const mergedSx = gutterSx ? [gutterSx, ...(Array.isArray(sx) ? sx : [sx])].filter(Boolean) : sx;

  return (
    <MuiContainer maxWidth={maxWidth} sx={mergedSx} {...rest}>
      {children}
    </MuiContainer>
  );
}

export default Container;
