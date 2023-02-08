import { expect, Page } from '@playwright/test'

const baseURL = 'http://localhost:4173/'
const luna = '朙月拼音'

function textarea (page: Page) {
  return page.locator('textarea')
}

function panel (page: Page) {
  return page.locator('.n-popover')
}

function item (page: Page, text: string) {
  return panel(page).locator(`text=${text}`)
}

async function input (page: Page, ...sequences: string[]) {
  for (const sequence of sequences) {
    for (const key of sequence) {
      await page.keyboard.press(key)
    }
  }
}

async function inputCombo (page: Page, ...sequences: string[]) {
  for (const sequence of sequences) {
    for (const key of sequence) {
      await page.keyboard.down(key)
    }
    for (const key of sequence) {
      await page.keyboard.up(key)
    }
  }
}

function expectValue (page: Page, value: string) {
  return expect(textarea(page)).toHaveValue(value)
}

async function selectIME (page: Page, ime: string) {
  const select = page.locator('.n-select')
  await select.click()
  const options = page.locator('.n-base-select-option')
  await expect(options.nth(1)).toBeVisible()
  const target = options.getByText(ime, { exact: true })
  while (!await target.isVisible()) {
    await page.keyboard.press('ArrowDown')
  }
  await target.click()
  return expect(select).toHaveText(ime) // ensure changed
}

function menu (page: Page) {
  return page.getByRole('group').nth(0).getByRole('button')
}

async function changeVariant (page: Page, variant: string) {
  const button = menu(page).nth(1)
  await button.click()
  return expect(button).toHaveText(variant)
}

function changeWidth (page: Page) {
  return menu(page).nth(2).click()
}

export { baseURL, luna, textarea, panel, item, menu, input, inputCombo, expectValue, selectIME, changeVariant, changeWidth }
