import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/context'
import { UploadDialog } from './UploadDialog'
import { api } from './api'
import type { Project } from './api'

vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api')>()),
  api: vi.fn().mockResolvedValue({ versionId: 'new-version' }),
}))

describe('multi-image upload workflow', () => {
  it('combines multi-select and file drops, supports both ordering controls, and submits one ordered batch', async () => {
    const user = userEvent.setup()
    const uploaded = vi.fn()
    const act = vi.fn(async (fn: () => Promise<unknown>) => {
      await fn()
      return true
    })
    render(
      <LocaleProvider>
        <UploadDialog
          project={{ id: 'project' } as Project}
          pending={false}
          act={act}
          onUploaded={uploaded}
        />
      </LocaleProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Upload images' }))
    const dialog = screen.getByRole('dialog')
    const scope = within(dialog)
    const first = new File(['first'], 'one.png', { type: 'image/png' }),
      second = new File(['second'], 'two.png', { type: 'image/png' }),
      third = new File(['third'], 'three.png', { type: 'image/png' })
    const input = dialog.querySelector('input[type="file"]') as HTMLInputElement
    expect(input.multiple).toBe(true)
    await user.upload(input, [first, second])
    fireEvent.drop(scope.getByRole('region', { name: 'Drop images here' }), {
      dataTransfer: { files: [third], types: ['Files'] },
    })
    expect(scope.getAllByRole('listitem')).toHaveLength(3)
    await user.click(scope.getByRole('button', { name: 'Move image earlier 2' }))
    const store: Record<string, string> = {}
    const transfer = {
      types: ['text/plain'],
      setData: (type: string, value: string) => {
        store[type] = value
      },
      getData: (type: string) => store[type] ?? '',
      effectAllowed: '',
      dropEffect: '',
    }
    const rows = scope.getAllByRole('listitem')
    fireEvent.dragStart(rows[2], { dataTransfer: transfer })
    fireEvent.dragOver(rows[0], { dataTransfer: transfer })
    fireEvent.drop(rows[0], { dataTransfer: transfer })
    expect(
      scope
        .getAllByRole('listitem')
        .map((row) => row.querySelector('.p-sortable-filename')?.textContent),
    ).toEqual(['three.png', 'two.png', 'one.png'])
    await user.click(scope.getByRole('button', { name: 'Upload images' }))
    await waitFor(() => expect(uploaded).toHaveBeenCalledWith('new-version'))
    const [path, options] = vi.mocked(api).mock.calls.at(-1)!
    expect(path).toBe('/projects/project/uploads')
    expect(
      (options!.body as { images: { filename: string; data: string }[] }).images.map(
        (image) => image.filename,
      ),
    ).toEqual(['three.png', 'two.png', 'one.png'])
    expect(
      (options!.body as { images: { data: string }[] }).images.every(
        (image) => image.data.length > 0,
      ),
    ).toBe(true)
  })
})
