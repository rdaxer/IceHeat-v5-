import {Config} from '@remotion/cli/config';

// Ausgabeformat der Shorts
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // automatisch nach CPU-Kernen
