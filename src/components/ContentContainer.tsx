import Box from '@mui/material/Box';

type ContentContainerProps = {
  children: JSX.Element[] | any,
}

const ContentContainer = ({children}: ContentContainerProps): JSX.Element => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      justifyContent="center"
      alignItems="center"
      padding={4}
      gap={2}>
      {children}
    </Box>
  );
}

export const externalDivProps = {
  // Hack for slide since it needs to hold a ref
  display: "flex",
  height: "100%",
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
}

export default ContentContainer