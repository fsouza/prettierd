import * as TWEEN from '@tweenjs/tween.js';

import { BlockType, BlockTypeInfo } from '@/boards/blockTypes';
import { Board, BoardOptions } from '@/boards/board';
import {
	LevelledCharacter,
	SessionCharacter,
	SessionCharacterCallbacks
} from '@/characters/character';
import { ILoadable } from '@/common/types';
import { game } from '@/core/game';
import { app } from '@/core/render';
import { LevelConfig, LevelSchemaConfig, WorldConfig } from '@/levels/types';
import { useConversationStore } from '@/stores/conversationStore';
import {
	Assets,
	Container,
	Point,
	Resource,
	Sprite,
	Texture,
	Ticker,
	UnresolvedAsset,
	Text,
	TextStyle,
	ColorMatrixFilter,
	ISize,
	Graphics,
	Spritesheet,
	NineSlicePlane
} from 'pixi.js';
import { Button, ButtonContainer, List } from '@pixi/ui';

import {
	randomFloat,
	getContainerSize,
	addBgToContainer,
	redText,
	assertUnreachable,
	createRng,

	getRange,
	getter,
	clamp
} from '@/common/utils';

import { OutlineFilter } from '@pixi/filter-outline';
import { addFilterToSprite, addOutlineFilter } from '@/common/effects';
import { TurnHandler } from './turnHandler';
import { calculateDamage } from '@/battle/battle';
import { DamageEvent, DamageLog, DamageType } from '@/battle/types';
import { findMoves } from '@/boards/solver';
import { applyOverrideSchema } from '@/levels/levelConfigs';
import { usePlayerStore } from '@/stores/playerStore';
import { useProgressStore } from '@/stores/progressStore';
import { BoardSessionResult } from './types';
import { applyRewards, getCompletionRewards } from '@/rewards/utils';
import {
	createBulletDamageEmitter,
	easeTowardsPos,
	newDelayTween,
	newEmptyTween,
	setSpawnPos
} from '@/battle/particles';
import { TileC, TileM } from '@/common/tiling';
import { AppliedRewardsResults } from '@/rewards/types';
import BoardGrid, {
	BoardGridCallbacks,
	BoardGridOptions,
	damageTypeColors
} from '@/boards/boardGrid';
import { useTrackingStore } from '@/stores/trackingStore';
import { BaddieId } from '@/characters/characterDefinitions';
import {
	castBlockRemovalSpell,
	createBoardState,
	identifyMatches,
	iterateBoardState,
	swapPieces
} from '@/boards/logicalBoard';
import { BoardLayout, RemovalConfig } from '@/boards/types';
import { cellIndexToString, printBoard } from '@/boards/logicalUtils';
import { getCenter, getScreenCenter } from '@/boards/utils';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';
import { trackEvent, trackEventNoData } from '@/tracking/data';
import * as ui from '@/boardSession/boardUi';
import { getSpritesheet, referenceSpritesheet } from '@/core/spritesheets';

export declare type BoardSessionCallbacks = {
	gameDone: (playerWon: boolean, rewarded: AppliedRewardsResults | null) => void;
	showInspectChar: (char: SessionCharacter) => void;
	showInspectPower: (spell: Power) => void;
	hideInspects: () => void;
};

export type Power = {
	name: string;
	description: string;
	icon: string;
	activationCallback: () => void;
};


const sendHealParticle = (
	container: Container,
	texture: Texture<Resource>,
	originPos_: TileC,
	targetPos_: TileC
) => {
	const startingHexColor = '0x00ff00'; //damageTypeColors[damageType];

	// let bulletTexture = this.loadedAssets['board-part-fire-explosion'];
	// if (damageType == DamageType.WATER) {
	// 	bulletTexture = this.loadedAssets['board-part-circle'];
	// } else if (damageType == DamageType.LIGHTNING) {
	// 	bulletTexture = this.loadedAssets['board-part-lightning'];
	// }

	/** particle that will be moved */
	const bulletEmitter = createBulletDamageEmitter(container, texture, startingHexColor);

	/** a little randomness to the origin and target positions */
	const drunkenness = 30;
	const addDrunk = (num: number) => {
		return num + randomFloat(-drunkenness, drunkenness);
	};

	const originPos = originPos_.log('origin').map(addDrunk);
	bulletEmitter.updateSpawnPos(originPos.x, originPos.y);
	bulletEmitter.emit = false;
	const targetPos = targetPos_.map(addDrunk);
};
