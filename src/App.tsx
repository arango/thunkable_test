import React from 'react';
import './App.css';
import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import {
	RootState,
	Project,
	AppDispatch,
	selectProjects,
	addProjectAsync,
	deleteProjectAsync,
	editProjectsAsync
} from './store';
import { Modal } from 'antd';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors
} from '@dnd-kit/core';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy
} from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import ProjectRow from './ProjectRow';
import { Typography, Button } from 'antd';

const { Text } = Typography;

function App() {
	const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
	const rawProjects: Project[] = useAppSelector(selectProjects);
	const projects = [...rawProjects].sort((a, b) => {
		return a.weight && b.weight ? a.weight - b.weight : 0;
	});
	const dispatch = useDispatch<AppDispatch>();
	const [pendingDelete, setPendingDelete] = React.useState<string | null>(null);

	const addProject = () => {
		dispatch(addProjectAsync(null));
	};

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5
			}
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (active && over && active.id !== over.id) {
			const activeIDX = projects.findIndex(
				(project) => project.id === active.id
			);
			const overIDX = projects.findIndex((project) => project.id === over.id);
			const edits: Project[] = [];
			edits.push({
				id: projects[activeIDX].id,
				weight: projects[overIDX].weight
			});
			if (activeIDX > overIDX) {
				// active is moving up
				for (let i = overIDX; i < activeIDX; i++) {
					let project = projects[i];
					edits.push({
						id: project.id,
						weight: project.weight ? project.weight + 1 : undefined
					});
				}
			} else {
				//active is moving down
				for (let i = overIDX; i > activeIDX; i--) {
					let project = projects[i];
					edits.push({
						id: project.id,
						weight: project.weight ? project.weight - 1 : undefined
					});
				}
			}
			dispatch(editProjectsAsync(edits));
		}
	};

	const setDeleteConfirm = (id: string, immediate: boolean) => {
		if (immediate) {
			dispatch(deleteProjectAsync(id));
		} else {
			setPendingDelete(id);
		}
	};

	const clearDeleteConfirm = () => {
		setPendingDelete(null);
	};

	const deleteProject = () => {
		if (pendingDelete) {
			dispatch(deleteProjectAsync(pendingDelete));
			setPendingDelete(null);
		}
	};
	return (
		<div className="content">
			<div className="header">
				<img src="/ThunkableBeaver.png" className="headerImage" alt="Icon" />
				<Text className="headerTitle">My Projects</Text>
			</div>
			<div className="body">
				<div className="list">
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}>
						<SortableContext
							items={projects.map((i) => i.id)}
							strategy={verticalListSortingStrategy}>
							{projects.map((project) => (
								<ProjectRow
									key={project.id}
									project={project}
									setDeleteConfirm={setDeleteConfirm}
								/>
							))}
						</SortableContext>
					</DndContext>
				</div>
			</div>
			<Button shape="circle" className="addButton" onClick={addProject}>
				<img src="/PlusSign.svg" alt="Add Product" />
			</Button>
			<Modal
				title="Are you sure you want to delete this project?"
				open={pendingDelete !== null}
				onOk={deleteProject}
				onCancel={clearDeleteConfirm}>
				<p>This action can't be undone</p>
			</Modal>
		</div>
	);
}

export default App;
