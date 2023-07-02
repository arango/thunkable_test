import {
	configureStore,
	ThunkAction,
	Action,
	createAsyncThunk,
	createSlice
} from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export interface ProjectState {
	projects: Project[];
	status: string;
}
export interface Project {
	id: string;
	name?: string;
	dateCreated?: number;
	weight?: number;
}

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action<string>
>;

const initialState: ProjectState = {
	projects: [],
	status: 'IDLE'
};

// I know these aren't _actually" async, but if this were real, they probably would be
export const addProjectAsync = createAsyncThunk(
	'projectAdd',
	async (name: string | null) => {
		const newProject: Project = {
			id: uuidv4(),
			dateCreated: new Date().getTime()
		};
		if (name) {
			newProject.name = name;
		}
		return newProject;
	}
);

export const deleteProjectAsync = createAsyncThunk(
	'projectDelete',
	async (id: string) => {
		return id;
	}
);

export const editProjectAsync = createAsyncThunk(
	'projectEdit',
	async (project: Project) => {
		return project;
	}
);

export const editProjectsAsync = createAsyncThunk(
	'projectsEdit',
	async (projects: Project[]) => {
		return projects;
	}
);

export const projectSlice = createSlice({
	name: 'project',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(addProjectAsync.pending, (state) => {
				state.status = 'LOADING';
			})
			.addCase(addProjectAsync.fulfilled, (state, action) => {
				state.status = 'IDLE';
				let weight: number = 1;
				if (state.projects && state.projects.length) {
					const sorted = [...state.projects].sort((a, b) => {
						return a.weight && b.weight ? b.weight - a.weight : 0;
					});
					weight = sorted[0].weight ? sorted[0].weight + 1 : 1;
				}
				state.projects.push({ ...action.payload, weight: weight });
			})
			.addCase(addProjectAsync.rejected, (state) => {
				state.status = 'IDLE';
			})
			.addCase(deleteProjectAsync.pending, (state) => {
				state.status = 'LOADING';
			})
			.addCase(deleteProjectAsync.fulfilled, (state, action) => {
				state.projects = state.projects.filter(
					(project) => project.id !== action.payload
				);
			})
			.addCase(deleteProjectAsync.rejected, (state) => {
				state.status = 'IDLE';
			})
			.addCase(editProjectAsync.pending, (state) => {
				state.status = 'LOADING';
			})
			.addCase(editProjectAsync.fulfilled, (state, action) => {
				const idx = state.projects.findIndex(
					(project) => project.id === action.payload.id
				);
				if (idx >= 0) {
					state.projects[idx] = {
						...state.projects[idx],
						...action.payload
					};
				}
			})
			.addCase(editProjectAsync.rejected, (state) => {
				state.status = 'IDLE';
			})
			.addCase(editProjectsAsync.pending, (state) => {
				state.status = 'LOADING';
			})
			.addCase(editProjectsAsync.fulfilled, (state, action) => {
				action.payload.forEach((payload) => {
					const idx = state.projects.findIndex(
						(project) => project.id === payload.id
					);
					if (idx >= 0) {
						state.projects[idx] = {
							...state.projects[idx],
							...payload
						};
					}
				});
			})
			.addCase(editProjectsAsync.rejected, (state) => {
				state.status = 'IDLE';
			});
	}
});

export const store = configureStore({
	reducer: {
		projects: projectSlice.reducer
	}
});

export const selectProjects = (state: RootState) => state.projects.projects;
