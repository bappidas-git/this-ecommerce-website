import { useState } from 'react';
import Chip from '@mui/material/Chip';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import AppIconButton from '../../../components/common/AppIconButton/AppIconButton.jsx';

import styles from './CategoryTree.module.css';

const FALLBACK_THUMB =
  'https://placehold.co/80x80/E5DED2/1B1A17?text=THIS&font=playfair';

function TreeRow({
  node,
  depth,
  isFirst,
  isLast,
  expanded,
  onToggle,
  selectedId,
  onSelect,
  onMove,
  onEdit,
  onDelete,
  canWrite,
  getProductCount,
  busyId,
}) {
  const hasChildren = node.children?.length > 0;
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const isBusy = busyId === node.id;
  const count = getProductCount(node.id);

  return (
    <li className={styles.item}>
      <div
        className={[
          styles.row,
          isSelected ? styles.rowSelected : '',
          isBusy ? styles.rowBusy : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ paddingLeft: 12 + depth * 18 }}
      >
        <button
          type="button"
          className={styles.chevron}
          onClick={() => hasChildren && onToggle(node.id)}
          aria-label={
            hasChildren ? (isOpen ? 'Collapse' : 'Expand') : 'No children'
          }
          aria-expanded={hasChildren ? isOpen : undefined}
          tabIndex={hasChildren ? 0 : -1}
        >
          {hasChildren ? (
            isOpen ? (
              <ExpandMoreRoundedIcon fontSize="small" />
            ) : (
              <ChevronRightRoundedIcon fontSize="small" />
            )
          ) : (
            <span className={styles.chevronEmpty} aria-hidden />
          )}
        </button>

        <button
          type="button"
          className={styles.body}
          onClick={() => onSelect(node)}
        >
          <img
            src={node.image || FALLBACK_THUMB}
            alt=""
            className={styles.thumb}
            width={40}
            height={40}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_THUMB;
            }}
          />
          <span className={styles.text}>
            <span className={styles.name}>{node.name || 'Untitled'}</span>
            <span className={styles.slug}>/{node.slug || ''}</span>
          </span>
          <Chip
            size="small"
            label={`${count} product${count === 1 ? '' : 's'}`}
            className={styles.countChip}
          />
        </button>

        <span className={styles.actions}>
          {canWrite ? (
            <>
              <AppIconButton
                size="small"
                tooltip="Move up"
                onClick={() => onMove(node, 'up')}
                disabled={isFirst || isBusy}
              >
                <ArrowUpwardRoundedIcon fontSize="small" />
              </AppIconButton>
              <AppIconButton
                size="small"
                tooltip="Move down"
                onClick={() => onMove(node, 'down')}
                disabled={isLast || isBusy}
              >
                <ArrowDownwardRoundedIcon fontSize="small" />
              </AppIconButton>
              <AppIconButton
                size="small"
                tooltip="Edit"
                onClick={() => onEdit(node)}
              >
                <EditOutlinedIcon fontSize="small" />
              </AppIconButton>
              <AppIconButton
                size="small"
                tooltip="Delete"
                onClick={() => onDelete(node)}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </AppIconButton>
            </>
          ) : null}
        </span>
      </div>

      {hasChildren && isOpen ? (
        <ul className={styles.children}>
          {node.children.map((child, idx) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              isFirst={idx === 0}
              isLast={idx === node.children.length - 1}
              expanded={expanded}
              onToggle={onToggle}
              selectedId={selectedId}
              onSelect={onSelect}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
              canWrite={canWrite}
              getProductCount={getProductCount}
              busyId={busyId}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function CategoryTree({
  tree,
  selectedId,
  onSelect,
  onMove,
  onEdit,
  onDelete,
  canWrite,
  getProductCount,
  busyId,
}) {
  const [expanded, setExpanded] = useState(() => {
    const set = new Set();
    tree.forEach((n) => set.add(n.id));
    return set;
  });

  const onToggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ul className={styles.root} role="tree">
      {tree.map((node, idx) => (
        <TreeRow
          key={node.id}
          node={node}
          depth={0}
          isFirst={idx === 0}
          isLast={idx === tree.length - 1}
          expanded={expanded}
          onToggle={onToggle}
          selectedId={selectedId}
          onSelect={onSelect}
          onMove={onMove}
          onEdit={onEdit}
          onDelete={onDelete}
          canWrite={canWrite}
          getProductCount={getProductCount}
          busyId={busyId}
        />
      ))}
    </ul>
  );
}

export default CategoryTree;
