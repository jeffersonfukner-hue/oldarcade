import type {Level} from '../../scripts/pixelQuest/levels';
import {firstLevel} from './level-1-1';
import {createForestLevel} from './forestDesign';
export const worldOneLevels:readonly Level[]=[firstLevel,createForestLevel('1-2'),createForestLevel('1-3')];
export const worldOneTotal=worldOneLevels.length;
