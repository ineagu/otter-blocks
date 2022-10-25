import { BlockProps, BorderType, ImagePosition, InspectorProps, MarginType, MediaImageProps, PaddingType } from '../../../helpers/blocks';

type Attributes = {
	id: string
	columns: number
	layout: string
	layoutTablet: string
	layoutMobile: string
	padding: PaddingType
	paddingTablet: PaddingType
	paddingMobile: PaddingType
	margin: MarginType
	marginTablet: MarginType
	marginMobile: MarginType
	columnsWidth: number|string
	horizontalAlign: string
	columnsHeight: string
	columnsHeightCustom: number|string
	columnsHeightCustomTablet: number|string
	columnsHeightCustomMobile: number|string
	verticalAlign: string
	color: string
	colorHover: string
	linkColor: string
	backgroundType: string
	backgroundColor: string
	backgroundImage: MediaImageProps
	backgroundAttachment: string
	backgroundPosition: ImagePosition
	backgroundRepeat: string
	backgroundSize: number
	backgroundGradient: string
	backgroundOverlayOpacity: number
	backgroundOverlayType: string
	backgroundOverlayColor: string
	backgroundOverlayImage: ImagePosition
	backgroundOverlayAttachment: string
	backgroundOverlayPosition: ImagePosition
	backgroundOverlayRepeat: string
	backgroundOverlaySize: number
	backgroundOverlayGradient: string
	backgroundOverlayFilterBlur: number
	backgroundOverlayFilterBrightness: number
	backgroundOverlayFilterContrast: number
	backgroundOverlayFilterGrayscale: number
	backgroundOverlayFilterHue: number
	backgroundOverlayFilterSaturate: number
	backgroundOverlayBlend: string
	border: BorderType
	borderColor: string
	borderRadius: BorderType
	boxShadow: boolean
	boxShadowColor: string
	boxShadowColorOpacity: number
	boxShadowBlur: number
	boxShadowSpread: number
	boxShadowHorizontal: number
	boxShadowVertical: number
	dividerTopType: string
	dividerTopColor: string
	dividerTopWidth: number
	dividerTopWidthTablet: number
	dividerTopWidthMobile: number
	dividerTopHeight: number
	dividerTopHeightTablet: number
	dividerTopHeightMobile: number
	dividerTopInvert: boolean
	dividerBottomType: string
	dividerBottomColor: string
	dividerBottomWidth: number
	dividerBottomWidthTablet: number
	dividerBottomWidthMobile: number
	dividerBottomHeight: number
	dividerBottomHeightTablet: number
	dividerBottomHeightMobile: number
	dividerBottomInvert: boolean
	hide: boolean
	hideTablet: boolean
	hideMobile: boolean
	reverseColumnsTablet: boolean
	reverseColumnsMobile: boolean
	columnsHTMLTag: string
	isSynced: string[]
}

export type SectionAttrs = Partial<Attributes>
export type SectionProps = BlockProps<Attributes>
export interface SectionInspector extends InspectorProps<Attributes> {}
