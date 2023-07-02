import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './App.css';
import type { Project } from './store';
import { useDispatch } from 'react-redux';
import { AppDispatch, editProjectAsync } from './store';
import { Typography } from 'antd';

const { Text } = Typography;

export interface ProjectRowProps {
	project: Project;
	setDeleteConfirm: Function;
}

export default function ProjectRow(props: ProjectRowProps) {
	const project = props.project;
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: project.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition
	};
	const dispatch = useDispatch<AppDispatch>();

	const deleteProject = (e: React.MouseEvent) => {
		const id = e.currentTarget.getAttribute('data-id');
		if (id) {
			// dispatch(deleteProjectAsync(id));
			props.setDeleteConfirm(id, false);
		}
	};

	const changeName = (name: string) => {
		setEditing(false);
		if (!name && !project.name) {
			props.setDeleteConfirm(project.id, true);
		} else if (!name) {
			return false;
		} else {
			dispatch(
				editProjectAsync({
					id: project.id,
					name: name
				})
			);
		}
	};
	const startEdit = () => {
		setEditing(true);
	};
	const [editing, setEditing] = React.useState(!project.name);
	const dt = project.dateCreated ? new Date(project.dateCreated) : null;
	return (
		<div
			className="productRow"
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}>
			<div>
				<Text
					editable={{
						onChange: changeName,
						editing: editing,
						onStart: startEdit,
						autoSize: false
					}}>
					{project.name}
				</Text>
			</div>
			<div>
				{dt && project.name
					? `${dt.toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
					  })} ${dt.toLocaleTimeString('en-US', {
							hour: 'numeric',
							minute: '2-digit'
					  })}`
					: null}
			</div>
			<div className="deleteIcon">
				{project.name ? (
					<img
						src="/DeleteIcon.svg"
						onClick={deleteProject}
						data-id={project.id}
						alt="Delete"
					/>
				) : null}
			</div>
		</div>
	);
}
