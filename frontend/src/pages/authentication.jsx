import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import AppTheme from '../shared-theme/AppTheme.jsx';
import ColorModeSelect from '../shared-theme/ColorModeSelect.jsx';
import SignInCard from './components/SignInCard.jsx';
import '../styles/home.css';

export default function SignInSide(props) {
  console.log(props);
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div className='navbar'>
            <a href="/" className='brand-name'>
              <h2>MeetInVirtual</h2>
            </a>
            <ColorModeSelect />
        </div>

        <Stack
          direction="column"
          component="main"
          sx={[
            {
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              width: '100%',
              boxSizing: 'border-box',
              overflow: 'auto'
            },
            (theme) => ({
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                zIndex: -1,
                inset: 0,
                backgroundImage:
                  'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
                backgroundRepeat: 'no-repeat',
                ...theme.applyStyles('dark', {
                  backgroundImage:
                    'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
                }),
              },
            }),
          ]}
        >
          <Box sx={{ width: '100%', maxWidth: '450px', p: { xs: 2, sm: 4 }, boxSizing: 'border-box' }}>
            <SignInCard />
          </Box>
        </Stack>
      </Box>
    </AppTheme>
  );
}
