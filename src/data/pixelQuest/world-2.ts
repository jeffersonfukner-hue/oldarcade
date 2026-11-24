import type {Level} from '../../scripts/pixelQuest/levels';
import {createCrystalCavernsLevel} from './crystalCavernsDesign';
export const worldTwoLevels:readonly Level[]=(['2-1','2-2','2-3'] as const).map(createCrystalCavernsLevel);
export const worldTwoTotal=worldTwoLevels.length;
